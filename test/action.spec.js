/// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpResponse, http, server } from './support/server.js';

// Create mock functions
const mockGetInput = vi.fn();
const mockGetBooleanInput = vi.fn();
const mockSetFailed = vi.fn();
const mockSetOutput = vi.fn();
const mockInfo = vi.fn();
const mockDebug = vi.fn();
const mockWarning = vi.fn();

// Create a mutable context object
const mockContext = {
	owner: 'test-owner',
	payload: {
		pull_request: {
			number: 99,
		},
	},
	sha: '',
	eventName: '',
	ref: '',
	workflow: '',
	action: '',
	actor: '',
	job: '',
	runId: 123,
	runNumber: 123,
	apiUrl: '',
	serverUrl: '',
	graphqlUrl: '',
	issue: {
		owner: 'gh-user',
		repo: 'best-repo-ever',
		number: 345,
	},
	repo: {
		owner: 'gh-user',
		repo: 'best-repo-ever',
	},
};

// Mock @actions/core
vi.mock('@actions/core', () => ({
	getInput: mockGetInput,
	getBooleanInput: mockGetBooleanInput,
	setFailed: mockSetFailed,
	setOutput: mockSetOutput,
	info: mockInfo,
	debug: mockDebug,
	warning: mockWarning,
}));

// Mock @actions/github - we need to provide a mock getOctokit that uses fetch (interceptable by MSW)
vi.mock('@actions/github', async (importOriginal) => {
	const original = await importOriginal();
	return {
		getOctokit: (token) => {
			// Use the real getOctokit but ensure requests go through MSW
			return original.getOctokit(token, {
				request: {
					fetch: globalThis.fetch,
				},
			});
		},
		context: mockContext,
	};
});

// Import after mocks are set up
const { run } = await import('../action.js');

beforeEach(() => {
	// Reset context to defaults before each test
	mockContext.owner = 'test-owner';
	mockContext.repo = 'test-repo';
	mockContext.payload = { pull_request: { number: 99 } };
	mockContext.sha = '';
	mockContext.eventName = '';
	mockContext.ref = '';
	mockContext.workflow = '';
	mockContext.action = '';
	mockContext.actor = '';
	mockContext.job = '';
	mockContext.runId = 123;
	mockContext.runNumber = 123;
	mockContext.apiUrl = '';
	mockContext.serverUrl = '';
	mockContext.graphqlUrl = '';
	mockContext.issue = { owner: 'gh-user', repo: 'best-repo-ever', number: 345 };
	mockContext.repo = { owner: 'gh-user', repo: 'best-repo-ever' };
});

afterEach(() => {
	vi.resetAllMocks();
});

describe('wait for vercel preview', () => {
	describe('environment setup', () => {
		test('exits if the token is not provided', async () => {
			setInputs({
				token: '',
			});

			await run();

			expect(mockSetFailed).toBeCalledWith('Required field `token` was not provided');
		});

		test('exits if there is no PR number', async () => {
			setInputs({
				token: 'a-token',
			});

			setGithubContext({
				payload: {
					pull_request: {
						number: undefined,
					},
				},
			});

			await run();

			expect(mockSetFailed).toHaveBeenCalledWith('No pull request number was found');
		});

		test('exits if there is no info about the PR', async () => {
			setInputs({
				token: 'a-token',
			});
			setGithubContext({
				payload: {
					pull_request: {
						number: 99,
					},
				},
			});
			ghResponse('/repos/gh-user/best-repo-ever/pulls/99', 404, {
				message: 'Not Found',
			});

			await run();

			expect(mockSetFailed).toHaveBeenCalledWith('Not Found');
		});

		test('exits if there is no Vercel deployment status found', async () => {
			setInputs({
				token: 'a-token',
				max_timeout: 5,
				check_interval: 1,
			});
			setGithubContext({
				payload: {
					pull_request: {
						number: 99,
					},
				},
			});
			ghResponse('/repos/gh-user/best-repo-ever/pulls/99', 200, {
				head: {
					sha: 'abcdef12345678',
				},
			});

			ghResponse('/repos/gh-user/best-repo-ever/deployments', 303, {});

			await run();

			expect(mockSetFailed).toHaveBeenCalledWith('no vercel deployment found, exiting...');
		});
	});

	test('resolves the output URL from the vercel deployment', async () => {
		setInputs({
			token: 'a-token',
			check_interval: 1,
			max_timeout: 10,
		});

		givenValidGithubResponses();

		// Simulate deployment race-condition
		httpTimes('https://api.github.com/repos/gh-user/best-repo-ever/deployments', [
			{
				status: 200,
				body: [
					{
						id: 'a1a1a1',
						creator: {
							login: 'a-user',
						},
					},
				],
				times: 2,
			},
			{
				status: 200,
				body: [
					{
						id: 'a1a1a1',
						creator: {
							login: 'a-user',
						},
					},
					{
						id: 'b2b2b2',
						creator: {
							login: 'vercel[bot]',
						},
					},
				],
				times: 1,
			},
		]);

		httpTimes('https://my-preview.vercel.app/', [
			{
				status: 404,
				body: '',
				times: 3,
			},
			{
				status: 200,
				body: '',
				times: 1,
			},
		]);

		await run();

		expect(mockSetFailed).not.toBeCalled();
		expect(mockSetOutput).toBeCalledWith('url', 'https://my-preview.vercel.app/');
	});

	test('can find the sha from the github context', async () => {
		setInputs({
			token: 'a-token',
			check_interval: 1,
			max_timeout: 10,
		});

		setGithubContext({
			sha: 'abcdef12345678',
		});

		givenValidGithubResponses();

		httpTimes('https://my-preview.vercel.app', [
			{
				status: 200,
				body: 'ok!',
				times: 1,
			},
		]);

		await run();

		expect(mockSetFailed).not.toBeCalled();
		expect(mockSetOutput).toBeCalledWith('url', 'https://my-preview.vercel.app/');
	});

	test('can wait for a specific path', async () => {
		setInputs({
			token: 'a-token',
			check_interval: 1,
			max_timeout: 10,
			path: '/wp-admin.php',
		});

		givenValidGithubResponses();

		httpTimes('https://my-preview.vercel.app/wp-admin.php', [
			{
				status: 404,
				body: 'not found',
				times: 2,
			},
			{
				status: 200,
				body: 'custom path!',
				times: 1,
			},
		]);

		await run();

		expect(mockSetFailed).not.toBeCalled();
		expect(mockSetOutput).toBeCalledWith('url', 'https://my-preview.vercel.app/');
	});

	test('authenticates with the provided vercel_password', async () => {
		setInputs({
			token: 'a-token',
			vercel_password: 'top-secret',
			check_interval: 1,
		});

		givenValidGithubResponses();

		httpTimes('https://my-preview.vercel.app/', [
			{
				status: 404,
				body: '',
				times: 2,
			},
			{
				status: 200,
				body: '',
				times: 1,
			},
		]);

		server.use(
			http.post('https://my-preview.vercel.app/', () => {
				return new HttpResponse('', {
					status: 303,
					headers: {
						'Set-Cookie': '_vercel_jwt=a-super-secret-jwt; Path=/; HttpOnly',
					},
				});
			})
		);

		await run();

		expect(mockSetFailed).not.toBeCalled();
		expect(mockSetOutput).toHaveBeenCalledWith('url', 'https://my-preview.vercel.app/');
		expect(mockSetOutput).toHaveBeenCalledWith('vercel_jwt', 'a-super-secret-jwt');
	});

	test('fails if allow_inactive is set to false but the only status is inactive', async () => {
		setInputs({
			token: 'a-token',
			allow_inactive: 'false',
			max_timeout: 5,
			check_interval: 1,
		});

		setGithubContext({
			payload: {
				pull_request: {
					number: 99,
				},
			},
		});

		ghResponse('/repos/gh-user/best-repo-ever/pulls/99', 200, {
			head: {
				sha: 'abcdef12345678',
			},
		});

		ghResponse('/repos/gh-user/best-repo-ever/deployments', 200, [
			{
				id: 'fake-deployment-id',
				creator: {
					login: 'vercel[bot]',
				},
			},
		]);

		ghResponse('/repos/gh-user/best-repo-ever/deployments/fake-deployment-id/statuses', 200, [
			{
				state: 'inactive',
				target_url: 'https://my-preview.vercel.app/',
			},
		]);

		await run();

		expect(mockSetFailed).toHaveBeenCalledWith('Timeout reached: Unable to wait for an deployment to be successful');
	});

	test('succeeds if allow_inactive is set to true and the only status is inactive', async () => {
		setInputs({
			token: 'a-token',
			allow_inactive: 'true',
			max_timeout: 5,
			check_interval: 1,
		});

		setGithubContext({
			payload: {
				pull_request: {
					number: 99,
				},
			},
		});

		ghResponse('/repos/gh-user/best-repo-ever/pulls/99', 200, {
			head: {
				sha: 'abcdef12345678',
			},
		});

		ghResponse('/repos/gh-user/best-repo-ever/deployments', 200, [
			{
				id: 'fake-deployment-id',
				creator: {
					login: 'vercel[bot]',
				},
			},
		]);

		ghResponse('/repos/gh-user/best-repo-ever/deployments/fake-deployment-id/statuses', 200, [
			{
				state: 'inactive',
				target_url: 'https://my-preview.vercel.app/',
			},
		]);

		httpTimes('https://my-preview.vercel.app/', [
			{
				status: 200,
				body: 'OK!',
				times: 1,
			},
		]);

		await run();

		expect(mockSetFailed).not.toHaveBeenCalled();

		expect(mockSetOutput).toHaveBeenCalledWith('url', 'https://my-preview.vercel.app/');
	});
});

/**
 *
 * @param {{
 *  token?: string,
 *  vercel_password?: string;
 *  allow_inactive?: string;
 *  check_interval?: number;
 *  max_timeout?: number;
 *  path?: string;
 *  }} inputs
 */
function setInputs(inputs = {}) {
	mockGetInput.mockImplementation((key) => {
		switch (key) {
			case 'token':
				return inputs.token || '';
			case 'vercel_password':
				return inputs.vercel_password || '';
			case 'check_interval':
				return `${inputs.check_interval || ''}`;
			case 'max_timeout':
				return `${inputs.max_timeout || ''}`;
			case 'path':
				return `${inputs.path || ''}`;
			default:
				return '';
		}
	});

	mockGetBooleanInput.mockImplementation((key) => {
		switch (key) {
			case 'allow_inactive':
				return String(inputs.allow_inactive).toLowerCase() === 'true';
			default:
				return false;
		}
	});
}

function setGithubContext(ctx) {
	Object.assign(mockContext, deepMerge(mockContext, ctx));
}

function deepMerge(target, source) {
	const result = { ...target };
	for (const key of Object.keys(source)) {
		if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
			result[key] = deepMerge(target[key] || {}, source[key]);
		} else {
			result[key] = source[key];
		}
	}
	return result;
}

function ghResponse(uri, status, data) {
	server.use(
		http.get(`https://api.github.com${uri}`, () => {
			return HttpResponse.json(data, { status });
		})
	);
}

function ghRespondOnce(uri, status, data) {
	server.use(
		http.get(
			`https://api.github.com${uri}`,
			() => {
				return HttpResponse.json(data, { status });
			},
			{ once: true }
		)
	);
}

function httpTimes(uri, payloads) {
	let count = 0;
	let cursor = 0;

	server.use(
		http.get(uri, () => {
			let payload = payloads[cursor];

			if (count < payload.times) {
				count = count + 1;

				if (typeof payload.body === 'string') {
					return new HttpResponse(payload.body, { status: payload.status });
				}

				return HttpResponse.json(payload.body, { status: payload.status });
			}

			cursor = cursor + 1;
			count = 1;
			payload = payloads[cursor];

			if (typeof payload.body === 'string') {
				return new HttpResponse(payload.body, { status: payload.status });
			}

			return HttpResponse.json(payload.body, { status: payload.status });
		})
	);
}

function givenValidGithubResponses() {
	setGithubContext({
		payload: {
			pull_request: {
				number: 99,
			},
		},
	});

	ghResponse('/repos/gh-user/best-repo-ever/pulls/99', 200, {
		head: {
			sha: 'abcdef12345678',
		},
	});

	ghResponse('/repos/gh-user/best-repo-ever/deployments', 200, [
		{
			id: 'a1a1a1',
			creator: {
				login: 'a-user',
			},
		},
		{
			id: 'b2b2b2',
			creator: {
				login: 'vercel[bot]',
			},
		},
	]);

	const statusEndpoint = '/repos/gh-user/best-repo-ever/deployments/b2b2b2/statuses';

	ghRespondOnce(statusEndpoint, 200, [
		{
			state: 'in-progress',
		},
	]);

	ghRespondOnce(statusEndpoint, 200, [
		{
			state: 'success',
			target_url: 'https://my-preview.vercel.app/',
		},
	]);
}
