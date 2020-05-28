const core = require("@actions/core");
const github = require("@actions/github");

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

const run = async () => {
    try {        

        // Inputs
        const GITHUB_TOKEN = core.getInput('token', { required: true })
        let PR_NUMBER = core.getInput('pr_number', { required: true })
        const MAX_TIMEOUT = Number(core.getInput("max_timeout")) || 60;        

        // Fail if we have don't have a github token
        if (!GITHUB_TOKEN ) {
            core.setFailed('Required field `token` was not provided')
        }

        if (!PR_NUMBER) {
            console.log('No PR_NUMBER was provided trying with: ' + github.context.issue.number)
            PR_NUMBER = github.context.issue.number
        }

        const octokit = new github.GitHub(GITHUB_TOKEN);
        
        const context = github.context;
        const owner = context.repo.owner
        const repo = context.repo.repo 

        // Get information about the pull request
        const currentPR = await octokit.pulls.get({
            owner,
            repo,
            pull_number: PR_NUMBER
        })

        // Get Ref from pull request
        const prREF = currentPR.data.head.ref

        // List statuses for ref
        const statuses = await octokit.repos.listStatusesForRef({
            owner,
            repo,
            ref: prREF
        })

        // Get latest status
        const status = statuses.data.length > 0 && statuses.data[0];

        // Get target url
        const targetUrl = status.target_url

        // Set output
        core.setOutput('url', targetUrl);

        // Wait for url to respond with a sucess
        console.log(`Waiting for a status code 200 from: ${url}`);
        await waitForUrl(url, MAX_TIMEOUT);
    
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();