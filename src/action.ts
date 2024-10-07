import { getInput, setFailed, setOutput } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import { handleAll, retry, IterableBackoff } from 'cockatiel';
import { generateBackoffIntervals } from './generate-backoff-intervals';
import { findDeployment } from './find-deployment';
import { findSuccessfulDeployment } from './find-successful-deployment';
import { healthCheck } from './health-check';

export async function runAction() {
  try {
    /**
     * Github token - given by the GitHub environment
     */
    const GITHUB_TOKEN = getInput('token', { required: true });
    /**
     * @deprecated use VERCEL_PROTECTION_BYPASS_SECRET instead
     */
    const VERCEL_PASSWORD = getInput('vercel_password');
    /**
     * @deprecated use VERCEL_PROTECTION_BYPASS_SECRET instead
     */
    const VERCEL_PROTECTION_BYPASS_HEADER = getInput('vercel_protection_bypass_header');
    const VERCEL_PROTECTION_BYPASS_SECRET = getInput('vercel_protection_bypass_secret');
    /**
     * The deployment environment to check
     */
    const ENVIRONMENT = getInput('environment');

    /**
     * Weather or not to allow inactive deployments as a valid deployment
     */
    const ALLOW_INACTIVE = Boolean(getInput('allow_inactive')) || false;

    /**
     * A path on the deployment URL to run the health check on
     */
    const PATH = getInput('path') || '';

    /**
     * @deprecated use max_attempts instead to control the retry policy
     */
    const MAX_TIMEOUT = Number(getInput('max_timeout')) || 60;
    /**
     * @deprecated use max_attempts instead to control the retry policy
     */
    const CHECK_INTERVAL_IN_MS = (Number(getInput('check_interval')) || 2) * 1000;

    /**
     * The maximum number of attempts to retry
     * @default 20
     */
    const MAX_RETRY_ATTEMPTS = Number(getInput('max_attempts')) || 20;

    /**
     * The interval between each retry attempt (defined in seconds)
     * @default 30s
     */
    const RETRY_INTERVAL = Number(getInput('retry_interval')) || 30;

    /**
     * The name of the actor that created the deployment
     * @default vercel[bot]
     */
    const CREATOR_NAME = getInput('deployment_creator_name') || 'vercel[bot]';

    /**
     * The retry policy for the all the different requests
     * @remarks
     * We generate an array of backoff intervals that will be used to retry the requests based on the number of MAX_RETRY_ATTEMPTS
     * for each attempt we add 30 seconds to the backoff interval.
     * E.g. if MAX_RETRY_ATTEMPTS is 5, the backoff intervals will be [0, 30000, 60000, 90000, 120000]
     */

    const backoffIntervals = generateBackoffIntervals(MAX_RETRY_ATTEMPTS - 1, RETRY_INTERVAL);
    const backoff = new IterableBackoff(backoffIntervals);
    const retryPolicy = retry(handleAll, { maxAttempts: MAX_RETRY_ATTEMPTS - 1, backoff });

    /**
     * Check if required fields are provided
     */
    if (!GITHUB_TOKEN) {
      setFailed('Required field "token" was not provided');
      return;
    }

    /**
     * Setup Octokit and our contextual information
     */
    const octokit = getOctokit(GITHUB_TOKEN, {
      request: fetch,
    });
    const { owner, repo } = context.repo;
    const { sha } = context;

    if (!sha) {
      setFailed(
        'Unable to determine SHA from context. Exiting... Make sure that the action is running on a pull_request event.'
      );
      return;
    }

    /**
     * Stage 1 - Find a deployment for the given owner/repo/sha/environment/actor
     */
    const foundDeployment = await retryPolicy.execute(({ attempt }) => {
      console.log(
        `Stage 1 – Attempt %d/%d to find deployment with environment "%s" and deployment.creator.login "%s"`,
        attempt + 1,
        MAX_RETRY_ATTEMPTS,
        ENVIRONMENT,
        CREATOR_NAME
      );
      return findDeployment({
        client: octokit,
        owner,
        repo,
        sha: sha,
        environment: ENVIRONMENT,
        creatorName: CREATOR_NAME,
      });
    });

    if (!foundDeployment) {
      setFailed(
        `No deployment found that matched either environment "${ENVIRONMENT}" or creator of deployment "${CREATOR_NAME}", exiting...`
      );
      return;
    }

    console.log('Found deployment with id "%d" and description "%s"', foundDeployment?.id, foundDeployment.description);

    /**
     * Stage 2 - Wait for the given deployment to get a state of either "success" or "inactive" if allow_inactve is set to true
     */
    const deployment = await retryPolicy.execute(({ attempt }) => {
      console.log(
        `Stage 2 – Attempt %d/%d to find a deployment with status of "success"`,
        attempt + 1,
        MAX_RETRY_ATTEMPTS
      );
      return findSuccessfulDeployment({
        client: octokit,
        owner,
        repo,
        deployment_id: foundDeployment.id,
        allow_inactive: ALLOW_INACTIVE,
      });
    });

    if (!deployment) {
      setFailed(
        'No deployment found that was either successful or inactive (applicable only if allow_inactive is set to true)'
      );
      return;
    } else if (!deployment.log_url) {
      setFailed(`no target_url found in the status check`);
      return;
    }

    console.log('Found deployment with log_url', deployment.log_url);

    /**
     * Stage 3 - Perform a health check on the deployment URL
     */
    const healthCheckUrl = deployment.log_url + PATH;
    const isOk = await retryPolicy.execute(({ attempt }) => {
      console.log(
        'Stage 3 - Attempt %d/%d to perform health check for url "%s"',
        attempt + 1,
        MAX_RETRY_ATTEMPTS,
        healthCheckUrl
      );
      return healthCheck({
        url: healthCheckUrl,
        vercel_bypass_secret: VERCEL_PROTECTION_BYPASS_SECRET,
      });
    });

    if (!isOk) {
      setFailed(
        `Health check failed for url: "%s" - make sure that you either provide a bypass secret or turn off deployment protection`
      );
      return;
    }

    // ALL GOOD!
    setOutput('url', healthCheckUrl);
    console.log('Health check passed for url "%s"', healthCheckUrl);
    return;
  } catch (error) {
    setFailed(error.message);
  }
}
