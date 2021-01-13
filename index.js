const core = require("@actions/core");
const github = require("@actions/github");
const axios = require('axios');

const waitForUrl = async (url, MAX_TIMEOUT) => {
    const iterations = MAX_TIMEOUT / 2;
    for (let i = 0; i < iterations; i++) {
        try {
            await axios.get(url);
            return;
        } catch (e) {
            console.log("Url unavailable, retrying...");
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    core.setFailed(`Timeout reached: Unable to connect to ${url}`);
};

const waitForStatus = async ({ token, owner, repo, deployment_id }, MAX_TIMEOUT) => {

    const octokit = new github.getOctokit(token);
    const iterations = MAX_TIMEOUT / 2;

    for (let i = 0; i < iterations; i++) {
        try {
            const statuses = await octokit.repos.listDeploymentStatuses({
                owner,
                repo,
                deployment_id
            })

            const status = statuses.data.length > 0 && statuses.data[0];

            if ( !status ) {
                throw Error('No status was available')
            } else if ( status && status.state !== 'success')
                throw Error('No status with state "success" was available')
            if (status && status.state === 'success' ) {
                return status
            } else {
                throw Error('Unknown status error')
            }
            
        } catch (e) {
            console.log("Deployment unavailable or not successful, retrying...");
            console.log(e)
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    core.setFailed(`Timeout reached: Unable to wait for an deployment to be successful`);
}

const run = async () => {
    try {

        // Inputs
        const GITHUB_TOKEN = core.getInput('token', { required: true })
        const ENVIRONMENT = core.getInput('environment')
        const MAX_TIMEOUT = Number(core.getInput("max_timeout")) || 60;

        // Fail if we have don't have a github token
        if (!GITHUB_TOKEN) {
            core.setFailed('Required field `token` was not provided')
        }

        const octokit = new github.getOctokit(GITHUB_TOKEN);

        const context = github.context;
        const owner = context.repo.owner
        const repo = context.repo.repo
        const PR_NUMBER = github.context.payload.pull_request.number

        if (!PR_NUMBER) {
            core.setFailed('No pull request number was found')
        }

        // Get information about the pull request
        const currentPR = await octokit.pulls.get({
            owner,
            repo,
            pull_number: PR_NUMBER
        })

        if (currentPR.status !== 200) {
            core.setFailed('Could not get information about the current pull request')
        }

        // Get Ref from pull request        
        const prSHA = currentPR.data.head.sha

        // Get deployments associated with the pull request
        const deployments = await octokit.repos.listDeployments({
            owner,
            repo,
            sha: prSHA,
            environment: ENVIRONMENT
        })

        const deployment = deployments.data.length > 0 && deployments.data[0];

        const status = await waitForStatus({ 
            owner,
            repo,
            deployment_id: deployment.id,
            token: GITHUB_TOKEN
        }, MAX_TIMEOUT)

        // Get target url
        const targetUrl = status.target_url

        console.log('target url »', targetUrl)

        // Set output
        core.setOutput('url', targetUrl);

        // Wait for url to respond with a sucess
        console.log(`Waiting for a status code 200 from: ${targetUrl}`);
        await waitForUrl(targetUrl, MAX_TIMEOUT);

    } catch (error) {
        core.setFailed(error.message);
    }
};

run();