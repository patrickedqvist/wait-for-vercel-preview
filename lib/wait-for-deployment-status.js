const core = require('@actions/core');

const calculateIterations = require('./calculate-iterations');
const wait = require('./wait');

/**
 * Handle a deployment status
 * @param {Object} status - The deployment status
 * @param {Object} options - Options
 * @returns {Object|void} - Returns a successful or inactive deployment status, or if neither then throw an error
 */
function handleDeploymentStatus(status, { allowInactive = false }) {
  // If there is no status, throw an error
  if (!status) {
    throw new Error('No deployment status was available');
  }

  // The different state can be (error|failure|inactive|pending|success|queued|in_progress)
  switch (status.state) {
    // If the status is successful, return the status
    case 'success': {
      return status;
    }

    // If the status is inactive, and we allow inactive statuses, return the status
    case 'inactive': {
      // If the status is inactive, and we allow inactive statuses, return the status
      if (allowInactive === true) {
        return status;
      }
      throw new Error(
        `Deployment status is "inactive", if you want you can allow these to be considered successfully by enabling the "allowInactive" option`
      );
    }

    // If the status is any of the following, throw an error
    case 'error':
    case 'failure':
    case 'pending':
    case 'queued':
    case 'in_progress': {
      throw new Error(`Deployment status is "${status.state}"`);
    }

    default: {
      // Any other case, throw an error
      throw new Error('Unknown status error');
    }
  }
}

/**
 * Checks a deployment for a successful deployment status,
 * it retries until the deployment is successful or the maximum timeout is reached.
 * @param {Octokit} octokit - An authenticated octokit instance
 * @param owner - The owner of the repository
 * @param repo - The name of the repository
 * @param deployment_id - The id of the deployment
 * @param maxTimeout - The maximum amount of time to wait for the deployment to be successful
 * @param checkIntervalInMilliseconds - The interval in milliseconds to check the deployment status
 * @param allowInactive - Whether to allow inactive deployments to be considered successful
 * @returns {Promise<Object>} - The deployment status see https://docs.github.com/en/rest/deployments/statuses?apiVersion=2022-11-28 for example object
 */
async function waitForDeploymentStatus({
  octokit,
  owner,
  repo,
  deployment_id,
  allowInactive,
  maxTimeout,
  checkIntervalInMilliseconds,
}) {
  core.info(
    `waitForDeploymentStatus › Performing checks for a successful deployment status against deployment id: ${deployment_id}`
  );

  // Calculate the number of iterations to perform
  const iterations = calculateIterations(
    maxTimeout,
    checkIntervalInMilliseconds
  );

  for (let i = 0; i < iterations; i++) {
    try {
      // Fetch all statuses for the deployment
      const statuses = await octokit.rest.repos.listDeploymentStatuses({
        owner,
        repo,
        deployment_id,
      });

      core.debug(
        `waitForDeploymentStatus › received the following deployment statuses: ${JSON.stringify(
          statuses,
          null,
          2
        )}`
      );

      // Grab the most recent status
      const status = statuses.data.length > 0 ? statuses.data[0] : null;

      // Handle the different statuses, successful statuses will be returned
      return handleDeploymentStatus(status, { allowInactive });
    } catch (error) {
      const attempt = i + 1;
      if (error && error instanceof Error) {
        core.info(`waitForDeploymentStatus › ${error.message})`);
        core.info(`waitForDeploymentStatus › retrying (attempt ${attempt} / ${iterations}`)
      } else {
        core.info(`waitForDeploymentStatus (unknown error): ${error.message}`);
        core.info(`waitForDeploymentStatus › retrying (attempt ${attempt} / ${iterations}`)
      }
      await wait(checkIntervalInMilliseconds);
    }
  }

  // If we reach this point, we have timed out
  core.setFailed(
    `Timeout reached: did not receive a deployment status of "success" within ${maxTimeout} seconds, consider increasing the "max_timeout" option.`
  );
}

module.exports = waitForDeploymentStatus;
