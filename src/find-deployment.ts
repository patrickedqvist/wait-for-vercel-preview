import type { GitHub } from '@actions/github/lib/utils';
import type { GithubRequestParameters } from './request-options';

interface FindDeploymentOptions extends GithubRequestParameters {
  /**
   * Instance of Octokit
   */
  client: InstanceType<typeof GitHub>;
  /**
   * The SHA recorded at creation time.
   */
  sha: string;
  /**
   * The name of the environment that was deployed to (e.g., staging or production).
   * For vercel pull request deployments this is usually "Preview".
   */
  environment: string;
  /**
   * The name of the one who created the deployment
   * For Vercel deployments this is normally "vercel[bot]"
   */
  creatorName: string;
}

/**
 * Finds a Github deployment
 *
 * @remarks
 * listDeployments required the following privileges:
 * - "Deployments" repository permissions (read)
 *
 * @throws If no deployments are available or if no deployment matches the passed creatorName to creator.login.name
 * @returns A promise that resolves to the deployment
 */
export async function findDeployment({ client, owner, repo, sha, environment, creatorName }: FindDeploymentOptions) {
  try {
    const deployments = await client.rest.repos.listDeployments({
      owner,
      repo,
      sha,
      environment,
    });

    if (!Array.isArray(deployments.data) || deployments.data.length === 0) {
      throw new Error(`Could not find any deployments for the given sha "${sha}" and environment "${environment}"`);
    }

    const deployment = deployments.data.find((d) => d.creator?.login === creatorName);

    if (!deployment) {
      const latestDeployment = deployments.data[0];
      const msg = `No deployment found that matched the deployment.creator.login name "${creatorName}" and environment "${environment}" for the sha "${sha}", instead latest deployment was created by "${latestDeployment.creator?.login}" with environment "${latestDeployment.environment}"`;
      throw new Error(msg);
    }

    return deployment;
  } catch (error) {
    throw error;
  }
}
