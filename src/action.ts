import { getInput, setFailed, setOutput } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import { handleAll, retry, IterableBackoff } from 'cockatiel';
import { generateBackoffIntervals } from './generate-backoff-intervals';
import { findPullRequest } from './find-pull-request';
import { findDeployment } from './find-deployment';
import { findSuccessfulDeployment } from './find-successful-deployment';
import { healthCheck } from './health-check';
import { deprecated } from './log';

export async function runAction() {
  try {
    /**
     * Github token - given by the GitHub environment
     */
    const GITHUB_TOKEN = getInput('token', { required: true });

    /**
     * A secret to bypass the Vercel protection of the deployment
     * @docs {@link https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation}
     */
    const VERCEL_PROTECTION_BYPASS_SECRET = getInput('vercel_protection_bypass_secret');

    /**
     * The deployment environment to check
     * @default "Preview"
     */
    const ENVIRONMENT = getInput('environment') || 'Preview';

    /**
     * Weather or not to allow inactive deployments as a valid deployment
     */
    const ALLOW_INACTIVE = Boolean(getInput('allow_inactive')) || false;

    /**
     * A path on the deployment URL to run the health check on
     */
    const PATH = getInput('path') || '';

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

    const defaultMaxTimeout = 60;
    /**
     * @deprecated use max_attempts instead to control the retry policy
     */
    const MAX_TIMEOUT = Number(getInput('max_timeout')) || defaultMaxTimeout;
    if (MAX_TIMEOUT !== defaultMaxTimeout) {
      deprecated('max_timeout', 'max_attempts');
    }

    const checkIntervalDefaultValue = 2 * 1000;
    /**
     * @deprecated use retry_interval instead to control the retry policy
     */
    const CHECK_INTERVAL_IN_MS = Number(getInput('check_interval')) * 1000 || checkIntervalDefaultValue;
    if (CHECK_INTERVAL_IN_MS !== checkIntervalDefaultValue) {
      deprecated('check_interval', 'max_attempts');
    }

    /**
     * @deprecated use VERCEL_PROTECTION_BYPASS_SECRET instead
     */
    const VERCEL_PASSWORD = getInput('vercel_password');
    if (VERCEL_PASSWORD) {
      deprecated('vercel_password', 'vercel_protection_bypass_secret');
    }

    /**
     * @deprecated use VERCEL_PROTECTION_BYPASS_SECRET instead
     */
    const VERCEL_PROTECTION_BYPASS_HEADER = getInput('vercel_protection_bypass_header');
    if (VERCEL_PROTECTION_BYPASS_HEADER) {
      deprecated('vercel_password', 'vercel_protection_bypass_secret');
    }

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
    const { pull_request } = context.payload;

    if (!pull_request) {
      setFailed('This action is only supported on pull_request events. Exiting...');
      return;
    }

    const pull_request_number = pull_request.number;

    if (!pull_request_number) {
      setFailed('Unable to determine pull request number from context. Exiting...');
      return;
    }

    /**
     * Stage 1 - Find the pull request
     */
    const pullRequest = await retryPolicy.execute(({ attempt }) => {
      console.log(
        `Stage 1 – Attempt %d/%d to get information about pull request "%d"`,
        attempt + 1,
        MAX_RETRY_ATTEMPTS,
        pull_request_number
      );
      return findPullRequest({
        client: octokit,
        owner,
        repo,
        pr_number: pull_request_number,
      });
    });

    const sha = pullRequest.head.sha;

    if (!pullRequest.head.sha) {
      setFailed('The pull request does not have a head sha, this is required to find the deployment. Exiting...');
      return;
    }

    console.log('Found pull request with title "%s" and sha "%s"', pullRequest.title, sha);

    /**
     * Stage 1 - Find a deployment for the given owner/repo/sha/environment/actor
     */
    const foundDeployment = await retryPolicy.execute(({ attempt }) => {
      console.log(
        `Stage 2 – Attempt %d/%d to find deployment with sha "%s", environment "%s" and deployment_creator_name "%s"`,
        attempt + 1,
        MAX_RETRY_ATTEMPTS,
        sha,
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
        `No deployment found that matched either sha "${sha}", environment "${ENVIRONMENT}" or creator of deployment "${CREATOR_NAME}", exiting...`
      );
      return;
    }

    console.log('Found deployment with id "%d" and description "%s"', foundDeployment?.id, foundDeployment.description);

    /**
     * Stage 2 - Wait for the given deployment to get a state of either "success" or "inactive" if allow_inactve is set to true
     */
    const deployment = await retryPolicy.execute(({ attempt }) => {
      console.log(
        `Stage 3 – Attempt %d/%d to find a deployment with status of "success"`,
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
        'Stage 4 - Attempt %d/%d to perform health check for url "%s"',
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
