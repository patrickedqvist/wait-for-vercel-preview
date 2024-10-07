interface GetShaFromPullRequestOptions {
  octokit: any;
  owner: string;
  repo: string;
  pr_number: number;
}

/**
 * Retrieves the SHA of the head commit for a given pull request.
 *
 * This function uses the GitHub Octokit API to fetch information about a specific pull request
 * and extract the SHA of its head commit. It's useful for getting the latest commit reference
 * associated with a pull request.
 *
 * @param {GetShaFromPullRequestOptions} options - The options for retrieving the SHA.
 * @param {any} options.octokit - An instance of the Octokit client for making GitHub API requests.
 * @param {string} options.owner - The owner of the repository.
 * @param {string} options.repo - The name of the repository.
 * @param {number} options.pr_number - The number of the pull request.
 *
 * @throws {Error} Throws an error if no PR number is provided or if the API request fails.
 *
 * @returns {Promise<string>} A promise that resolves to the SHA of the pull request's head commit.
 */
async function getShaFromPullRequest({
  octokit,
  owner,
  repo,
  pr_number,
}: GetShaFromPullRequestOptions) {
  if (!pr_number) {
    throw new Error('No PR number provided to getShaFromPullRequest');
  }

  // Get information about the pull request
  const currentPR = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pr_number,
  });

  if (currentPR.status !== 200) {
    throw new Error(
      `Failed to get pull request information for PR: ${pr_number}`
    );
  }

  // Get Ref from pull request
  const prSHA = currentPR.data.head.sha;

  return prSHA;
}
