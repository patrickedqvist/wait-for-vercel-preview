/// @ts-check

const { run } = require('../action');
const core = require('@actions/core');
const github = require('@actions/github');
const { server, rest } = require('./support/server');
const deepmerge = require('deepmerge');

jest.setTimeout(20000);

jest.mock('@actions/core', () => {
  return {
    getInput: jest.fn(),
    setFailed: jest.fn(),
    setOutput: jest.fn(),
  };
});

jest.mock('@actions/github', () => {
  const original = jest.requireActual('@actions/github');

  return {
    getOctokit: original.getOctokit,
    context: {
      owner: 'test-owner',
      repo: 'test-repo',
      payload: {
        pull_request: {
          number: 99,
        },
      },
    },
  };
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('wait for vercel preview', () => {
  describe('environment setup', () => {
    test('exits if the token is not provided', async () => {
      setInputs({
        token: '',
      });

      await run();

      expect(core.setFailed).toBeCalledWith(
        'Required field `token` was not provided'
      );
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

      expect(core.setFailed).toHaveBeenCalledWith(
        'No pull request number was found'
      );
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
      ghResponse('/repos/gh-user/best-repo-ever/pulls/99', 303, {});

      await run();

      expect(core.setFailed).toHaveBeenCalledWith(
        'Could not get information about the current pull request'
      );
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

      expect(core.setFailed).toHaveBeenCalledWith(
        'no vercel deployment found, exiting...'
      );
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
    restTimes(
      'https://api.github.com/repos/gh-user/best-repo-ever/deployments',
      [
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
      ]
    );

    restTimes('https://my-preview.vercel.app/', [
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

    expect(core.setFailed).not.toBeCalled();
    expect(core.setOutput).toBeCalledWith(
      'url',
      'https://my-preview.vercel.app/'
    );
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

    restTimes('https://my-preview.vercel.app', [
      {
        status: 200,
        body: 'ok!',
        times: 1,
      },
    ]);

    await run();

    expect(core.setFailed).not.toBeCalled();
    expect(core.setOutput).toBeCalledWith(
      'url',
      'https://my-preview.vercel.app/'
    );
  });

  test('can wait for a specific path', async () => {
    setInputs({
      token: 'a-token',
      check_interval: 1,
      max_timeout: 10,
      path: '/wp-admin.php',
    });

    givenValidGithubResponses();

    restTimes('https://my-preview.vercel.app/wp-admin.php', [
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

    expect(core.setFailed).not.toBeCalled();
    expect(core.setOutput).toBeCalledWith(
      'url',
      'https://my-preview.vercel.app/'
    );
  });

  test('authenticates with the provided vercel_password', async () => {
    setInputs({
      token: 'a-token',
      vercel_password: 'top-secret',
      check_interval: 1,
    });

    givenValidGithubResponses();

    restTimes('https://my-preview.vercel.app/', [
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
      rest.post('https://my-preview.vercel.app/', (req, res, ctx) => {
        return res(
          ctx.status(303),
          ctx.cookie('_vercel_jwt', 'a-super-secret-jwt'),
          ctx.body('')
        );
      })
    );

    await run();

    expect(core.setFailed).not.toBeCalled();
    expect(core.setOutput).toHaveBeenCalledWith(
      'url',
      'https://my-preview.vercel.app/'
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      'vercel_jwt',
      'a-super-secret-jwt'
    );
  });
});

/**
 *
 * @param {{
 *  token?: string,
 *  vercel_password?: string;
 *  check_interval?: number;
 *  max_timeout?: number;
 *  path?: string;
 *  }} inputs
 */
function setInputs(inputs = {}) {
  const spy = jest.spyOn(core, 'getInput');

  spy.mockImplementation((key) => {
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
}

function setGithubContext(ctx) {
  const defaultCtx = {
    eventName: '',
    sha: '',
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
    payload: {
      pull_request: {
        number: undefined,
      },
    },
  };

  // ts-check complains about assigning to a read-only property
  // @ts-ignore
  github.context = deepmerge(defaultCtx, ctx);
}

function ghResponse(uri, status, data) {
  server.use(
    rest.get(`https://api.github.com${uri}`, (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(data));
    })
  );
}

function ghRespondOnce(uri, status, data) {
  return restOnce(`https://api.github.com${uri}`, status, data);
}

function restOnce(uri, status, data) {
  server.use(
    rest.get(uri, (req, res, ctx) => {
      return res.once(ctx.status(status), ctx.json(data));
    })
  );
}

function restTimes(uri, payloads) {
  let count = 0;
  let cursor = 0;

  server.use(
    rest.get(uri, (req, res, ctx) => {
      let payload = payloads[cursor];

      if (count < payload.times) {
        count = count + 1;

        if (typeof payload.body === 'string') {
          return res(ctx.status(payload.status), ctx.body(payload.body));
        }

        return res(ctx.status(payload.status), ctx.json(payload.body));
      }

      cursor = cursor + 1;
      count = 1;
      payload = payloads[cursor];

      if (typeof payload.body === 'string') {
        return res(ctx.status(payload.status), ctx.body(payload.body));
      }

      return res(ctx.status(payload.status), ctx.json(payload.body));
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

  const statusEndpoint =
    '/repos/gh-user/best-repo-ever/deployments/b2b2b2/statuses';

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
