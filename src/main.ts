import * as core from '@actions/core'
import * as github from '@actions/github'

import waitForStatus from './wait-for-deployment-status'
import waitForUrl from './wait-for-url'

async function run(): Promise<void> {
  try {
    // Inputs
    const GITHUB_TOKEN = core.getInput('token', {required: true})
    const ENVIRONMENT = core.getInput('environment')
    const MAX_TIMEOUT = Number(core.getInput('max_timeout')) || 60
    const ALLOW_INACTIVE = Boolean(core.getInput('allow_inactive')) || false

    // Fail if we have don't have a github token
    if (!GITHUB_TOKEN) {
      core.setFailed('Required field `token` was not provided')
    }

    const octokit = github.getOctokit(GITHUB_TOKEN)

    const context = github.context
    const owner = context.repo.owner
    const repo = context.repo.repo
    const PR_NUMBER = github.context.payload.pull_request?.number

    if (!PR_NUMBER) {
      core.setFailed('No pull request number was found')
      return
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

    const deployment = deployments.data.length > 0 && deployments.data[0]

    if (!deployment) {
      core.setFailed('No deployment was available')
      return
    }

    const status = await waitForStatus(
      {
        owner,
        repo,
        deployment_id: deployment.id,
        token: GITHUB_TOKEN
      },
      MAX_TIMEOUT,
      ALLOW_INACTIVE
    )

    if (!status) {
      core.setFailed('No deployment status was available')
      return
    }

    // Get target url
    const targetUrl = status.target_url

    // Set output
    core.info(`deployment url available, setting output to ${targetUrl}`)
    core.setOutput('url', targetUrl)

    // Wait for url to respond with a success
    await waitForUrl(targetUrl, MAX_TIMEOUT)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
