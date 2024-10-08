import type { GitHub } from '@actions/github/lib/utils';
import type { GithubRequestParameters } from './request-options';

interface FindPullRequestOptions extends GithubRequestParameters {
  /**
   * Instance of Octokit
   */
  client: InstanceType<typeof GitHub>;
  /**
   * The pull request number
   */
  pr_number: number;
}

/**
 * Retrieves the SHA of the head commit for a given pull request.
 *
 * @remarks
 * This function uses the GitHub Octokit API to fetch information about a specific pull request
 * and extract the SHA of its head commit. It's useful for getting the latest commit reference
 * associated with a pull request.
 *
 * It requires at least one of the following permission sets:
 * - "Pull requests" repository permissions (read)
 * - "Contents" repository permissions (read)
 *
 * @throws Throws an error if no PR number is provided or if the API request fails.
 * @returns A promise that resolves to the SHA of the pull request's head commit.
 */
export async function findPullRequest({ client, owner, repo, pr_number }: FindPullRequestOptions) {
  try {
    const response = await client.rest.pulls.get({
      owner,
      repo,
      pull_number: pr_number,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to get pull request information for PR number: ${pr_number}`);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}
