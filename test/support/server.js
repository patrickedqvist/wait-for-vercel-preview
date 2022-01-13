const { setupServer } = require('msw/node');
const { rest } = require('msw');

// This configures a request mocking server with the given request handlers.
exports.server = setupServer();
// rest.get('https://github.com/*', (req, res, ctx) => {
//   return res(ctx.json({ firstName: 'John' }));
// })

exports.rest = rest;
