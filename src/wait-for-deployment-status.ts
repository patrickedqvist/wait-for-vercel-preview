import * as core from '@actions/core'
import * as github from '@actions/github'

import type {DeploymentStatus} from './types'

import {StatusError} from './custom-errors'
import {wait} from './wait'

interface Options {
  token: string
  owner: string
  repo: string
  deployment_id: number
}

const waitForDeploymentStatus = async (
  {token, owner, repo, deployment_id}: Options,
  MAX_TIMEOUT: number,
  ALLOW_INACTIVE: boolean
): Promise<DeploymentStatus | void> => {
  // Init a new octokit client
  const octokit = github.getOctokit(token)
  // Set the number of tries we are going to check for a deployment status
  const iterations = MAX_TIMEOUT / 2

  // Loop through the iterations
  for (let i = 0; i < iterations; i++) {
    try {
      // Fetch statuses for a specific deployment
      const statuses = await octokit.repos.listDeploymentStatuses({
        owner,
        repo,
        deployment_id
      })

      // Pick out the latest deployment
      const status = statuses.data.length > 0 && statuses.data[0]

      // Handle the different type of scenarios, throwing a status leads to a new attempt
      if (!status) {
        throw new StatusError('No status was available for latest deployment')
      } else if (
        status &&
        ALLOW_INACTIVE === true &&
        status.state === 'inactive'
      ) {
        return status
      } else if (status && status.state === 'pending') {
        throw new StatusError('A deployment is pending')
      } else if (status && status.state === 'queued') {
        throw new StatusError('A deployment is queued')
      } else if (status && status.state === 'in_progress') {
        throw new StatusError('A deployment is in progress')
      } else if (status && status.state === 'error') {
        throw new StatusError(
          'The latest deployment received a status with an error'
        )
      } else if (status && status.state === 'failure') {
        core.setFailed('The latest deployment failed, aborting…')
      } else if (status && status.state === 'success') {
        core.info('Found a successful deployment')
        return status
      } else {
        throw new StatusError('Unknown status error')
      }
    } catch (e) {
      if (e instanceof StatusError) {
        core.info(e.message)
      } else {
        core.error(e)
      }
      // Lets try again after two seconds
      await wait(2000)
    }
  }
  core.setFailed(`Timeout reached: Unable to find a successful deployment`)
}

export default waitForDeploymentStatus
