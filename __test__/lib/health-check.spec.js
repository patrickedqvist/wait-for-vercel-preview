const core = require('@actions/core');
const healthCheck = require('../../lib/health-check');

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

it('should succeed when the URL returns 200 status', async () => {
  const config = {
    url: 'https://example.com',
    maxTimeout: 10,
    checkIntervalInMilliseconds: 1000,
    bypassSecret: null,
    path: '/available',
  };

  await healthCheck(config);

  expect(core.info).toHaveBeenCalledWith(
    'health check › Received success status code'
  );
});

it('should fail when the URL returns 401 status', async () => {
  const config = {
    url: 'https://example.com',
    maxTimeout: 10,
    checkIntervalInMilliseconds: 1000,
    bypassSecret: null,
    path: '/forbidden',
  };

  await healthCheck(config);

  expect(core.setFailed).toHaveBeenCalledWith(
    'Could not access the given URL. Consider adding a bypass secret. See https://vercel.com/docs/security/deployment-protection#protection-bypass-for-automation for documentation.'
  );
});

it('should succeed when configured with a bypass secret', async () => {
  const config = {
    url: 'https://example.com',
    maxTimeout: 10,
    checkIntervalInMilliseconds: 1000,
    bypassSecret: 'A-BYPASS-TOKEN',
    path: '/forbidden',
  };

  await healthCheck(config);

  expect(core.info).toHaveBeenCalledWith(
    'health check › Received success status code'
  );
  expect(core.setFailed).not.toHaveBeenCalled();
});

// TODO: Add a test that checks that the function retries the request
