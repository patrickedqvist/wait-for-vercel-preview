const core = require('@actions/core');
const github = require('@actions/github');

const calculateIterations = require('./lib/calculate-iterations');
const wait = require('./lib/wait');
const healthCheck = require('./lib/health-check');
const waitForDeploymentStatus = require('./lib/wait-for-deployment-status');

/**
 * Waits until the github API returns a deployment for
 * a given actor.
 *
 * Accounts for race conditions where this action starts
 * before the actor's action has started.
 *
 * @returns
 */
const waitForDeploymentToStart = async ({
  octokit,
  owner,
  repo,
  sha,
  environment,
  actorName = 'vercel[bot]',
  maxTimeout = 20,
  checkIntervalInMilliseconds = 2000,
}) => {
  const iterations = calculateIterations(
    maxTimeout,
    checkIntervalInMilliseconds
  );

  for (let i = 0; i < iterations; i++) {
    try {
      const deployments = await octokit.rest.repos.listDeployments({
        owner,
        repo,
        sha,
        environment,
      });

      const deployment =
        deployments.data.length > 0 &&
        deployments.data.find((deployment) => {
          return deployment.creator.login === actorName;
        });

      if (deployment) {
        return deployment;
      }

      console.log(
        `Could not find any deployments for actor ${actorName}, retrying (attempt ${
          i + 1
        } / ${iterations})`
      );
    } catch (e) {
      console.log(
        `Error while fetching deployments, retrying (attempt ${
          i + 1
        } / ${iterations})`
      );

      console.error(e);
    }

    await wait(checkIntervalInMilliseconds);
  }

  return null;
};

async function getShaForPullRequest({ octokit, owner, repo, number }) {
  const PR_NUMBER = number;

  if (!PR_NUMBER) {
    core.setFailed('No pull request number was found');
    return;
  }

  // Get information about the pull request
  const currentPR = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: PR_NUMBER,
  });

  if (currentPR.status !== 200) {
    core.setFailed('Could not get information about the current pull request');
    return;
  }

  return currentPR.data.head.sha;
}

const run = async () => {
  try {
    /**
     * Default values for the action inputs
     */
    const DEFAULT_MAX_TIMEOUT = 60;
    const DEFAULT_ALLOW_INACTIVE = false;
    const DEFAULT_RELATIVE_PATH = '/';
    const DEFAULT_CHECK_INTERVAL = 2;

    /**
     * Action inputs
     */
    // The GitHub token used to authenticate with the GitHub API
    const GITHUB_TOKEN = core.getInput('token', { required: true });

    // The Vercel password used to bypass the preview protection
    // @deprecated - use VERCEL_BYPASS_SECRET instead
    const VERCEL_PASSWORD = core.getInput('vercel_password');

    // The Vercel secret used to bypass the deployment protection
    // @docs https://vercel.com/docs/security/deployment-protection#protection-bypass-for-automation
    const VERCEL_BYPASS_SECRET = core.getInput('vercel_bypass_secret');

    // Specify the environment to filter GitHub deployments by (e.g., staging or production)
    const ENVIRONMENT = core.getInput('environment');

    // Whether to allow inactive deployments to be considered successful
    const ALLOW_INACTIVE =
      Boolean(core.getInput('allow_inactive')) || DEFAULT_ALLOW_INACTIVE;

    // The relative path to append to the URL
    const PATH = core.getInput('path') || DEFAULT_RELATIVE_PATH;

    // The maximum number of seconds to wait before timing out
    const MAX_TIMEOUT =
      Number(core.getInput('max_timeout')) || DEFAULT_MAX_TIMEOUT;

    // The number of seconds to wait between each request
    const CHECK_INTERVAL =
      Number(core.getInput('check_interval')) || DEFAULT_CHECK_INTERVAL;
    const CHECK_INTERVAL_IN_MS = CHECK_INTERVAL * 1000;

    /**
     * Safeguards - ensure required inputs are provided
     */
    if (!GITHUB_TOKEN) {
      core.setFailed('Required field `token` was not provided');
    }

    /**
     * Notify the user of using any deprecated inputs
     */

    if (VERCEL_PASSWORD) {
      core.notice(
        'The `vercel_password` input is deprecated. Please use the `vercel_bypass_secret` input instead.'
      );
    }

    /**
     * Set up our Octokit client to interact with the GitHub API
     * along with some other useful variables from the GitHub context provided by the action
     */

    const octokit = github.getOctokit(GITHUB_TOKEN);
    const context = github.context;
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const pr_number = context.payload.pull_request.number;
    let sha = context.sha; // The SHA is the commit id

    // If the action is running in debug mode, print the context object
    core.debug(`GitHub context: ${JSON.stringify(context, null, 2)}`);

    // There can be scenarios where the context.sha is not available
    // In this case, we can try to get the SHA from the pull request
    if (!sha && pr_number) {
      sha = await getShaForPullRequest({
        octokit,
        owner,
        repo,
        number: pr_number,
      });
    }

    // If we still don't have an SHA, we can't continue
    if (!sha) {
      core.setFailed('Unable to determine SHA. Exiting...');
      return;
    }

    // Get deployments associated with the pull request.
    const deployment = await waitForDeploymentToStart({
      octokit,
      owner,
      repo,
      sha: sha,
      environment: ENVIRONMENT,
      actorName: 'vercel[bot]',
      maxTimeout: MAX_TIMEOUT,
      checkIntervalInMilliseconds: CHECK_INTERVAL_IN_MS,
    });

    if (!deployment) {
      core.setFailed('no vercel deployment found, exiting...');
      return;
    }

    // Get the deployment statuses for the given deployment
    // This is to find a succesful or inactive (if allow_inactive = true) deployment
    // it retries until max timeout
    const status = await waitForDeploymentStatus({
      octokit,
      owner,
      repo,
      deployment_id: deployment.id,
      token: GITHUB_TOKEN,
      maxTimeout: MAX_TIMEOUT,
      allowInactive: ALLOW_INACTIVE,
      checkIntervalInMilliseconds: CHECK_INTERVAL_IN_MS,
    });

    // Get target url
    const targetUrl = status.target_url;

    if (!targetUrl) {
      core.setFailed(`no target_url found in the status check`);
      return;
    }

    core.notice(`output "url" set to ${targetUrl}`);

    // Set output
    core.setOutput('url', targetUrl);

    // Wait for url to respond with a success
    core.info(`Waiting for a status code 200 from: ${targetUrl}`);

    await healthCheck({
      url: targetUrl,
      maxTimeout: MAX_TIMEOUT,
      checkIntervalInMilliseconds: CHECK_INTERVAL_IN_MS,
      bypassSecret: VERCEL_BYPASS_SECRET,
      path: PATH,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
};

module.exports = run;
