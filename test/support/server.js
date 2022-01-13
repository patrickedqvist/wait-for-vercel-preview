const { setupServer } = require('msw/node');
const { rest } = require('msw');

// This configures a request mocking server with the given request handlers.
exports.server = setupServer();

exports.rest = rest;
