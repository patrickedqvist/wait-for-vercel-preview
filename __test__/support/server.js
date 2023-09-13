const { setupServer } = require('msw/node');
const { rest } = require('msw');

const externalHandlers = require('./mocks/external-handlers');
const githubHandlers = require('./mocks/github-handlers');

const combinedHandlers = [...externalHandlers, ...githubHandlers];

// This configures a request mocking server with the given request handlers.
exports.server = setupServer(...combinedHandlers);
exports.rest = rest;
