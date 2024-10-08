import type { GitHub } from '@actions/github/lib/utils';
import type { GithubRequestParameters } from './request-options';

interface GetShaFromPullRequestOptions extends GithubRequestParameters {
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
 * @deprecated This function is deprecated. It only remains for historical reasons and should not be used.
 * Often times, you can use the `context` object provided by the GitHub Actions Toolkit to get the SHA of the head commit.
 *
 * @remarks
 * This function uses the GitHub Octokit API to fetch information about a specific pull request
 * and extract the SHA of its head commit. It's useful for getting the latest commit reference
 * associated with a pull request.
 *
 * @throws Throws an error if no PR number is provided or if the API request fails.
 * @returns A promise that resolves to the SHA of the pull request's head commit.
 */
async function findPullRequest({ client, owner, repo, pr_number }: GetShaFromPullRequestOptions) {
  if (!pr_number) {
    throw new Error('No PR number provided to findPullRequest');
  }

  const currentPR = await client.rest.pulls.get({
    owner,
    repo,
    pull_number: pr_number,
  });

  if (currentPR.status !== 200) {
    throw new Error(`Failed to get pull request information for PR: ${pr_number}`);
  }

  const prSHA = currentPR.data.head.sha;
  return prSHA;
}
