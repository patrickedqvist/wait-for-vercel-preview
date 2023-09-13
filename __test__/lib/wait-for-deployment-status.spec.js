const core = require('@actions/core');
const github = require('@actions/github');
const waitForDeploymentStatus = require('../../lib/wait-for-deployment-status');
const listDeploymentStatuses = require('../fixtures/list-deployment-statuses.json');
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

it('should retry if not successful deployment was found', async () => {
  const config = {
    octokit: github.getOctokit('a-token'),
    owner: "octocat",
    repo: "example",
    deployment_id: 20, // note that this is to target a different deployment in the mock/fixture
    maxTimeout: 20,
    checkIntervalInMilliseconds: 2000,
    allowInactive: false,
  };

  const status = await waitForDeploymentStatus(config);
  console.log("test received status", status);
  expect(status).toBeUndefined();
});