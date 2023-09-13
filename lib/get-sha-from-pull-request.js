async function getSHAfromPullRequest({ octokit, owner, repo, number }) {
  const PR_NUMBER = number;

  if (!PR_NUMBER) {
    core.setFailed('No pull request number was found');
    return;
  }

  // Get information about the pull request
  const currentPR = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: PR_NUMBER,
  });

  if (currentPR.status !== 200) {
    core.setFailed('Could not get information about the current pull request');
    return;
  }

  return currentPR.data.head.sha;
}

module.exports = getSHAfromPullRequest;