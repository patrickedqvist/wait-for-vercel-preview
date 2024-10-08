import { describe, expect, it, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { assign } from 'radash';
import { server } from './mock/node';
import { runAction } from '../src/action';

// Start mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
//  Close mock server after all tests
afterAll(() => server.close());
// Reset handlers after each test `important for test isolation`
afterEach(() => {
  setGithubContext({});
  vi.resetAllMocks();
  server.resetHandlers();
});

// Mock the core module
vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setFailed: vi.fn(),
  setOutput: vi.fn(),
}));

vi.mock('@actions/github', async () => {
  const original = await vi.importActual('@actions/github');
  return {
    getOctokit: original.getOctokit,
    context: {
      owner: 'octocat',
      repo: 'example',
    },
  };
});

describe('wait for vercel preview', () => {
  it('should exit if no github token is provided', async () => {
    setInputs({
      token: '',
      max_attempts: 3,
    });
    setGithubContext({
      sha: '',
    });
    await runAction();
    expect(core.setFailed).toBeCalledWith('Required field "token" was not provided');
  });

  it('should exit if no pr_number or sha is available from the context', async () => {
    setInputs({
      token: 'a-token',
    });
    setGithubContext({
      sha: '',
      payload: {
        pull_request: {
          number: undefined,
        },
      },
    });
    await runAction();
    expect(core.setFailed).toHaveBeenCalledWith(
      'Could not find a sha to use, exiting... Are you running this action on a pull request or push event?'
    );
  });

  it('should exit if there is no deployment with status "success"', async () => {
    setInputs({
      token: 'a-token',
      deployment_creator_name: 'octofail',
      environment: 'production',
      max_attempts: 3,
      retry_interval: 1,
    });
    setGithubContext({});
    await runAction();
    expect(core.setFailed).toHaveBeenCalledWith(
      'No deployment found that matched the deployment.creator.login name "octofail" and environment "production" for the sha "a84d88e7554fc1fa21bcbc4efae3c782a70d2b9d", instead latest deployment was created by "octocat" with environment "production"'
    );
  });

  it('should set the output url', async () => {
    setInputs({
      token: 'a-token',
      deployment_creator_name: 'octocat',
      environment: 'production',
      max_attempts: 3,
    });
    setGithubContext({});
    await runAction();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith('url', 'https://example.com/deployment/42/output');
  });

  it('should pass along the "x-vercel-protection-bypass" header', async () => {
    setInputs({
      token: 'a-token',
      deployment_creator_name: 'octocat',
      environment: 'production',
      vercel_protection_bypass_secret: 'my-secret-bypass-token',
      path: '/protected',
      max_attempts: 3,
    });
    setGithubContext({});
    await runAction();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith('url', 'https://example.com/deployment/42/output/protected');
  });
});

interface SetInputsOptions {
  token?: string;
  environment?: string;
  deployment_creator_name?: string;
  path?: string;
  max_attempts?: number;
  vercel_protection_bypass_secret?: string;
  retry_interval?: number;
}
function setInputs(inputs: SetInputsOptions = {}) {
  const spy = vi.spyOn(core, 'getInput');

  spy.mockImplementation((key) => {
    switch (key) {
      case 'token':
        return inputs.token || '';
      case 'environment':
        return inputs.environment || '';
      case 'deployment_creator_name':
        return inputs.deployment_creator_name || '';
      case 'path':
        return inputs.path || '';
      case 'max_attempts':
        return `${inputs.max_attempts}` || '20';
      case 'vercel_protection_bypass_secret':
        return inputs.vercel_protection_bypass_secret || '';
      case 'retry_interval':
        return `${inputs.retry_interval}` || '30';
      default:
        return '';
    }
  });
}

interface GithubContext {
  sha: string;
  repo: {
    owner: string;
    repo: string;
  };
  payload: {
    pull_request?: {
      number?: number;
    };
  };
}

function setGithubContext(ctx: Partial<GithubContext>) {
  const defaultCtx: GithubContext = {
    sha: 'a84d88e7554fc1fa21bcbc4efae3c782a70d2b9d',
    repo: {
      owner: 'octocat',
      repo: 'example',
    },
    payload: {
      pull_request: {
        number: 1,
      },
    },
  };

  // @ts-expect-error - we are assigning to a read-only property
  github.context = assign(defaultCtx, ctx);
}
