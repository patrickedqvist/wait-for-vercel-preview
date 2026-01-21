// Dependencies are compiled using https://github.com/vercel/ncc
import * as core from '@actions/core';
import * as github from '@actions/github';
import axios from 'axios';
import setCookieParser from 'set-cookie-parser';

/**
 * Calculate the number of iterations based on timeout and interval
 * @param {number} maxTimeoutSec - Maximum timeout in seconds
 * @param {number} checkIntervalInMilliseconds - Check interval in milliseconds
 * @returns {number} Number of iterations
 */
const calculateIterations = (maxTimeoutSec, checkIntervalInMilliseconds) =>
	Math.floor(maxTimeoutSec / (checkIntervalInMilliseconds / 1000));

/**
 * Wait for a specified number of milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @typedef {Object} WaitForUrlOptions
 * @property {string} url - The URL to check
 * @property {number} maxTimeout - Maximum timeout in seconds
 * @property {number} checkIntervalInMilliseconds - Check interval in milliseconds
 * @property {string} [vercelPassword] - Vercel password for protected deployments
 * @property {string} [protectionBypassHeader] - Vercel protection bypass header
 * @property {string} path - Path to check
 */

/**
 * Wait for a URL to respond with a success status code
 * @param {WaitForUrlOptions} options - Options for waiting
 * @returns {Promise<void>}
 */
const waitForUrl = async ({
	url,
	maxTimeout,
	checkIntervalInMilliseconds,
	vercelPassword,
	protectionBypassHeader,
	path,
}) => {
	const iterations = calculateIterations(maxTimeout, checkIntervalInMilliseconds);

	for (let i = 0; i < iterations; i++) {
		try {
			let headers = {};

			if (vercelPassword) {
				const jwt = await getPassword({
					url,
					vercelPassword,
				});

				headers = {
					Cookie: `_vercel_jwt=${jwt}`,
				};

				core.setOutput('vercel_jwt', jwt);
			}

			if (protectionBypassHeader) {
				headers = {
					'x-vercel-protection-bypass': protectionBypassHeader,
				};
			}

			const checkUri = new URL(path, url);

			await axios.get(checkUri.toString(), {
				headers,
			});
			console.log('Received success status code');
			return;
		} catch (e) {
			// https://axios-http.com/docs/handling_errors
			if (e.response) {
				console.log(`GET status: ${e.response.status}. Attempt ${i} of ${iterations}`);
			} else if (e.request) {
				console.log(`GET error. A request was made, but no response was received. Attempt ${i} of ${iterations}`);
				console.log(e.message);
			} else {
				console.log(e);
			}

			await wait(checkIntervalInMilliseconds);
		}
	}

	core.setFailed(`Timeout reached: Unable to connect to ${url}`);
};

/**
 * See https://vercel.com/docs/errors#errors/bypassing-password-protection-programmatically
 * @param {{url: string; vercelPassword: string }} options vercel password options
 * @returns {Promise<string>}
 */
const getPassword = async ({ url, vercelPassword }) => {
	console.log('requesting vercel JWT');

	const data = new URLSearchParams();
	data.append('_vercel_password', vercelPassword);

	const response = await axios({
		url,
		method: 'post',
		data: data.toString(),
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
		},
		maxRedirects: 0,
		validateStatus: (status) => {
			// Vercel returns 303 with the _vercel_jwt
			return status >= 200 && status < 307;
		},
	});

	const setCookieHeader = response.headers['set-cookie'];

	if (!setCookieHeader) {
		throw new Error('no vercel JWT in response');
	}

	const cookies = setCookieParser(setCookieHeader);

	const vercelJwtCookie = cookies.find((cookie) => cookie.name === '_vercel_jwt');

	if (!vercelJwtCookie || !vercelJwtCookie.value) {
		throw new Error('no vercel JWT in response');
	}

	console.log('received vercel JWT');

	return vercelJwtCookie.value;
};

/** Custom error class for deployment status errors */
class StatusError extends Error {}

/**
 * @typedef {Object} WaitForStatusOptions
 * @property {string} token - GitHub token
 * @property {string} owner - Repository owner
 * @property {string} repo - Repository name
 * @property {number} deployment_id - Deployment ID
 * @property {number} maxTimeout - Maximum timeout in seconds
 * @property {boolean} allowInactive - Whether to allow inactive deployments
 * @property {number} checkIntervalInMilliseconds - Check interval in milliseconds
 */

/**
 * Wait for a deployment status to be successful
 * @param {WaitForStatusOptions} options - Options for waiting
 * @returns {Promise<Object|undefined>} The deployment status object
 */
const waitForStatus = async ({
	token,
	owner,
	repo,
	deployment_id,
	maxTimeout,
	allowInactive,
	checkIntervalInMilliseconds,
}) => {
	const octokit = github.getOctokit(token);
	const iterations = calculateIterations(maxTimeout, checkIntervalInMilliseconds);

	for (let i = 0; i < iterations; i++) {
		try {
			const statuses = await octokit.rest.repos.listDeploymentStatuses({
				owner,
				repo,
				deployment_id,
			});

			const status = statuses.data.length > 0 && statuses.data[0];

			if (!status) {
				throw new StatusError('No status was available');
			}

			if (status && allowInactive === true && status.state === 'inactive') {
				return status;
			}

			if (status && status.state !== 'success') {
				throw new StatusError('No status with state "success" was available');
			}

			if (status && status.state === 'success') {
				return status;
			}

			throw new StatusError('Unknown status error');
		} catch (e) {
			console.log(`Deployment unavailable or not successful, retrying (attempt ${i + 1} / ${iterations})`);
			if (e instanceof StatusError) {
				if (!e.message.includes('No status with state "success"')) {
					console.log(e.message);
				}
			} else {
				console.log(e);
			}
			await wait(checkIntervalInMilliseconds);
		}
	}
	core.setFailed('Timeout reached: Unable to wait for an deployment to be successful');
};

/**
 * @typedef {Object} WaitForDeploymentOptions
 * @property {Object} octokit - GitHub Octokit instance
 * @property {string} owner - Repository owner
 * @property {string} repo - Repository name
 * @property {string} sha - Git commit SHA
 * @property {string} [environment] - Deployment environment name
 * @property {string} [actorName='vercel[bot]'] - Actor name to filter deployments
 * @property {number} [maxTimeout=20] - Maximum timeout in seconds
 * @property {number} [checkIntervalInMilliseconds=2000] - Check interval in milliseconds
 */

/**
 * Waits until the GitHub API returns a deployment for a given actor.
 * Accounts for race conditions where this action starts before the actor's action has started.
 * @param {WaitForDeploymentOptions} options - Options for waiting
 * @returns {Promise<Object|null>} The deployment object or null if not found
 */
const waitForDeploymentToStart = async ({
	octokit,
	owner,
	repo,
	sha,
	environment,
	actorName = 'vercel[bot]',
	maxTimeout = 20,
	checkIntervalInMilliseconds = 2000,
}) => {
	const iterations = calculateIterations(maxTimeout, checkIntervalInMilliseconds);

	for (let i = 0; i < iterations; i++) {
		try {
			const deployments = await octokit.rest.repos.listDeployments({
				owner,
				repo,
				sha,
				environment,
			});

			const deployment =
				deployments.data.length > 0 &&
				deployments.data.find((deployment) => {
					return deployment.creator.login === actorName;
				});

			if (deployment) {
				return deployment;
			}

			console.log(`Could not find any deployments for actor ${actorName}, retrying (attempt ${i + 1} / ${iterations})`);
		} catch (e) {
			console.log(`Error while fetching deployments, retrying (attempt ${i + 1} / ${iterations})`);

			console.error(e);
		}

		await wait(checkIntervalInMilliseconds);
	}

	return null;
};

/**
 * Get the SHA for a pull request
 * @param {Object} options - Options
 * @param {Object} options.octokit - GitHub Octokit instance
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @returns {Promise<string|undefined>} The SHA of the pull request head
 */
async function getShaForPullRequest({ octokit, owner, repo }) {
	const PR_NUMBER = github.context.payload.pull_request.number;

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

	// Get Ref from pull request
	const prSHA = currentPR.data.head.sha;

	return prSHA;
}

/**
 * Main entry point for the GitHub Action
 * @returns {Promise<void>}
 */
export const run = async () => {
	try {
		// Inputs
		const GITHUB_TOKEN = core.getInput('token', { required: true });
		const VERCEL_PASSWORD = core.getInput('vercel_password');
		const VERCEL_PROTECTION_BYPASS_HEADER = core.getInput('vercel_protection_bypass_header');
		const ENVIRONMENT = core.getInput('environment');
		const MAX_TIMEOUT = Number(core.getInput('max_timeout')) || 60;
		const ALLOW_INACTIVE = core.getBooleanInput('allow_inactive');
		const PATH = core.getInput('path') || '/';
		const CHECK_INTERVAL_IN_MS = (Number(core.getInput('check_interval')) || 2) * 1000;

		// Fail if we have don't have a github token
		if (!GITHUB_TOKEN) {
			core.setFailed('Required field `token` was not provided');
			return;
		}

		const octokit = github.getOctokit(GITHUB_TOKEN);

		const context = github.context;
		const owner = context.repo.owner;
		const repo = context.repo.repo;

		/** @type {string|undefined} */
		let sha;

		if (github.context.payload?.pull_request) {
			sha = await getShaForPullRequest({
				octokit,
				owner,
				repo,
				number: github.context.payload.pull_request.number,
			});
		} else if (github.context.sha) {
			sha = github.context.sha;
		}

		if (!sha) {
			core.setFailed('Unable to determine SHA. Exiting...');
			return;
		}

		// Get deployments associated with the pull request.
		const deployment = await waitForDeploymentToStart({
			octokit,
			owner,
			repo,
			sha: sha,
			environment: ENVIRONMENT,
			actorName: 'vercel[bot]',
			maxTimeout: MAX_TIMEOUT,
			checkIntervalInMilliseconds: CHECK_INTERVAL_IN_MS,
		});

		if (!deployment) {
			core.setFailed('no vercel deployment found, exiting...');
			return;
		}

		const status = await waitForStatus({
			owner,
			repo,
			deployment_id: deployment.id,
			token: GITHUB_TOKEN,
			maxTimeout: MAX_TIMEOUT,
			allowInactive: ALLOW_INACTIVE,
			checkIntervalInMilliseconds: CHECK_INTERVAL_IN_MS,
		});

		// Get target url
		const targetUrl = status.target_url;

		if (!targetUrl) {
			core.setFailed('no target_url found in the status check');
			return;
		}

		console.log('target url »', targetUrl);

		// Set output
		core.setOutput('url', targetUrl);

		// Wait for url to respond with a success
		console.log(`Waiting for a status code 200 from: ${targetUrl}`);

		await waitForUrl({
			url: targetUrl,
			maxTimeout: MAX_TIMEOUT,
			checkIntervalInMilliseconds: CHECK_INTERVAL_IN_MS,
			vercelPassword: VERCEL_PASSWORD,
			protectionBypassHeader: VERCEL_PROTECTION_BYPASS_HEADER,
			path: PATH,
		});
	} catch (error) {
		core.setFailed(error.message);
	}
};
