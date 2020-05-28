const core = require("@actions/core");
const github = require("@actions/github");

const checkDeploymentStatus = async ({ token, owner, repo, deployment_id }, MAX_TIMEOUT) => {
    const iterations = MAX_TIMEOUT / 2;
    for (let i = 0; i < iterations; i++) {
        try {

            const octokit = new github.GitHub(token);

            const statuses = await octokit.repos.listDeploymentStatuses({
                owner,
                repo,
                deployment_id,
            })

            if ( statuses.data[0].state === 'success' ) {
                return statuses.data[0];
            } else if (result.data[0].state !== 'success') {
                throw Error('deployment status was not equal to `success`')
            }

        } catch (e) {
            console.log(e);
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
    core.setFailed(`Timeout reached: Unable to get deployment status`);
};

const run = async () => {
    try {        

        // Inputs
        const GITHUB_TOKEN = core.getInput('token')
        const MAX_TIMEOUT = Number(core.getInput("max_timeout")) || 60;        

        // Fail if we have don't have a github token
        if (!GITHUB_TOKEN ) {
            core.setFailed('Required field `token` was not provided')
        }

        const octokit = new github.GitHub(GITHUB_TOKEN);
        
        const context = github.context;

        const owner = context.repo.owner
        const repo = context.repo.repo                

        const deployments = await octokit.repos.listDeployments({
            ref,
            owner,
            repo,
            environment: 'Preview'
        })

        const latestDeployment = deployments.data[0]

        console.log('wait-for-vercel-preview latestDeployment »', latestDeployment)

        const status = await checkDeploymentStatus({
            token: GITHUB_TOKEN,
            owner,
            repo,
            deployment_id: latestDeployment.id
        }, MAX_TIMEOUT)

        console.log('wait-for-vercel-preview latestDeployment »', latestDeployment)

        if (status.state === 'success') {
            core.setOutput('url', status.target_url)
        } else {
            core.setFailed('Unable to get deployment status')
        }
    
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();