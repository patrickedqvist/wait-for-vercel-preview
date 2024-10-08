import type { GitHub } from '@actions/github/lib/utils';
import type { GithubRequestParameters } from './request-options';
import { DeploymentStatusError } from './errors';

const enum DeploymentStatus {
  Error = 'error',
  Failure = 'failure',
  Inactive = 'inactive',
  Pending = 'pending',
  Success = 'success',
  Queued = 'queued',
  InProgress = 'in_progress',
}

interface FindSuccessfulDeploymentOptions extends GithubRequestParameters {
  /**
   * Instance of Octokit
   */
  client: InstanceType<typeof GitHub>;
  /**
   * The ID of a deployment
   */
  deployment_id: number;
  /**
   * Whether to allow deployments with state "inactive" to be returned
   */
  allow_inactive: boolean;
}

/**
 * Finds a successful deployment
 *
 * @remarks
 * It requires the following privileges set on the GitHub token:
 * - "Deployments" repository permissions (read)
 *
 * @throws If no deployment statuses are available or if no deployment status matches the state "success"
 * @returns A promise that resolves to the deployment status
 */

export async function findSuccessfulDeployment(options: FindSuccessfulDeploymentOptions) {
  const response = await options.client.rest.repos.listDeploymentStatuses({
    owner: options.owner,
    repo: options.repo,
    deployment_id: options.deployment_id,
  });

  if (!Array.isArray(response.data) || response.data.length === 0) {
    throw new DeploymentStatusError('No deployment statuses were available at this time');
  }

  const status = response.data[0];

  if (!status) {
    throw new DeploymentStatusError('No status was available');
  }

  if (options.allow_inactive && status.state === DeploymentStatus.Inactive) {
    return status;
  } else if (status.state === DeploymentStatus.Success) {
    return status;
  } else {
    if (options.allow_inactive) {
      throw new DeploymentStatusError(
        `No status available that had a state of "success" or "inactive", instead received state "${status.state}"`
      );
    } else {
      throw new DeploymentStatusError(
        `No status available that had a state of "success", instead received state "${status.state}"`
      );
    }
  }
}
