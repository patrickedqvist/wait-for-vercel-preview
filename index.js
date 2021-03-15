const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

const sleepFor = ms => new Promise(r => setTimeout(r, ms));

// This flag allows us to avoid making requests after the action has been killed.
let isCanceled = false;
// Promise.race "works", but is limited due to the pending event loop.
// Using Promise.race, the event loop will not be empty and the action will succeed but at the max_timeout_ms.
// See: https://github.com/nodejs/node/issues/37683
const throwAfter = (fn, timeoutMs) =>
  new Promise((res, rej) => {
    const msg = `Maximum timeout of ${timeoutMs}ms has been reached, action has been cancelled.`;
    const timeout = setTimeout(() => rej(new Error(msg)), timeoutMs);
    fn()
      .then((...args) => {
        clearTimeout(timeout);
        res(...args);
      })
      .catch(rej);
  });
const poll = async (fn, delayMs, times = 1) => {
  console.log(`Polling attempted ${times} time(s).`);
  // Do not poll for anything if the entire action was killed.
  if (isCanceled) throw new Error('Job was cancelled, aborting.');
  let result;
  try {
    result = await fn();
  } catch (e) {
    console.log(`Polling error`, e);
  }
  if (result) return result;
  await sleepFor(delayMs);
  return poll(fn, delayMs, times + 1);
};

const runAction = async ({ token, env, githubPollMs, vercelPollMs, allowInactive }) => {
  const octokit = new github.getOctokit(token);
  const context = github.context;
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const pullNumber = github.context.payload.pull_request.number;
  if (!pullNumber) {
    throw new Error('No pull request number was found');
  }
  const currentPR = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });
  if (currentPR.status !== 200) {
    throw new Error('Could not get information about the current pull request');
  }
  const prSHA = currentPR.data.head.sha;

  console.log(`Polling for deployments every ${githubPollMs}ms.`);
  const deployment = await poll(async () => {
    const deployments = await octokit.repos.listDeployments({
      owner,
      repo,
      sha: prSHA,
      environment: env,
    });
    const deployment = deployments.data && deployments.data[0];
    console.log('deployment:');
    console.log(JSON.stringify(deployment, null, 2));
    return deployment;
  }, githubPollMs);

  console.log(
    `Polling for deployment status every ${githubPollMs}ms. Allowing Inactive deployments?: ${!!allowInactive}`,
  );
  const status = await poll(async () => {
    const statuses = await octokit.repos.listDeploymentStatuses({
      owner,
      repo,
      deployment_id: deployment.id,
    });
    console.log('deployment statuses');
    console.log(JSON.stringify(statuses, null, 2));
    const status = statuses.data.length > 0 && statuses.data[0];
    if (!status) {
      throw Error('No status was available');
    }
    if (allowInactive && status.state === 'inactive') {
      return status;
    }
    if (status.state === 'success') {
      return status;
    }
    throw Error('No state with the allowed status was available');
  }, githubPollMs);

  // Get target url, set output, wait for url to respond w success
  const targetUrl = status.target_url;
  console.log(`Polling for vercel deployment at ${targetUrl} every ${vercelPollMs}ms.`);
  core.setOutput('url', targetUrl);
  await poll(async () => {
    await axios.get(targetUrl);
    return true;
  }, vercelPollMs);
};

(async function main() {
  try {
    // In case Github actions does some weird caching.
    isCanceled = false;
    // Inputs
    const token = core.getInput('token', { required: true });
    const env = core.getInput('environment');
    const timeoutMs = (Number(core.getInput('max_timeout')) || 60) * 1000;
    const allowInactive = Boolean(core.getInput('allow_inactive')) || false;
    const githubPollMs = (Number(core.getInput('github_polling_interval')) || 20) * 1000;
    const vercelPollMs = (Number(core.getInput('github_polling_interval')) || 20) * 1000;
    // Fail if we have don't have a github token
    if (!token) {
      throw new Error('Required field `token` was not provided');
    }
    await throwAfter(
      () => runAction({ token, env, githubPollMs, vercelPollMs, allowInactive }),
      timeoutMs,
    );
  } catch (err) {
    // Avoid double cancellation
    if (isCanceled) return;
    isCanceled = true;
    core.setFailed(err.message);
  }
})();
