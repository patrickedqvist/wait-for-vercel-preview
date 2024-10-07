import type { GitHub } from '@actions/github/lib/utils';
import type { GithubRequestParameters } from './request-options';
import { DeploymentStatusError } from './errors';

const enum DeploymentStatus {
  Inactive = 'inactive',
  Success = 'success',
}

interface FindSuccessfulDeploymentOptions extends GithubRequestParameters {
  /**
   * Instance of Octokit
   */
  client: InstanceType<typeof GitHub>;
  deployment_id: number;
  allow_inactive: boolean;
}

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
    throw new DeploymentStatusError('No status available that had a state of "success"');
  }
}
