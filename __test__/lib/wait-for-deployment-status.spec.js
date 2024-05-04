const core = require('@actions/core');
const github = require('@actions/github');
const waitForDeploymentStatus = require('../../lib/wait-for-deployment-status');
const listDeploymentStatuses = require('../fixtures/list-deployment-statuses.json');

jest.setTimeout(20000);

jest.mock('@actions/core', () => {
  return {
    info: jest.fn(),
    setFailed: jest.fn(),
    debug: jest.fn(),
  };
});

afterEach(() => {
  jest.resetAllMocks();
});

it('should return a deployment that has the status "success"', async () => {
  const config = {
    octokit: github.getOctokit('a-token'),
    owner: "octocat",
    repo: "example",
    deployment_id: 10,
    maxTimeout: 20,
    checkIntervalInMilliseconds: 2000,
    allowInactive: false,
  };

  const status = await waitForDeploymentStatus(config);

  expect(status).toEqual(listDeploymentStatuses[0]);
});

it('should retry if no successful deployment was found', async () => {
  const config = {
    octokit: await github.getOctokit('a-token'),
    owner: "octocat",
    repo: "example",
    deployment_id: 20, // note that this is to target a different deployment in the mock/fixture
    maxTimeout: 5,
    checkIntervalInMilliseconds: 1000,
    allowInactive: false,
  };
  await waitForDeploymentStatus(config);
  // TODO: Find a better way to test the retry functionality other then spying on core.info
  expect(core.info).toHaveBeenLastCalledWith(`waitForDeploymentStatus › retrying (attempt ${5} / ${5}`)
  expect(core.setFailed).toHaveBeenCalled();
});

it('should fail if no successful deployment was found after its max iterations', async () => {
  const config = {
    octokit: await github.getOctokit('a-token'),
    owner: "octocat",
    repo: "example",
    deployment_id: 20, // note that this is to target a different deployment in the mock/fixture
    maxTimeout: 1,
    checkIntervalInMilliseconds: 1000,
    allowInactive: false,
  };
  await waitForDeploymentStatus(config);
  expect(core.setFailed).toHaveBeenCalled();
});