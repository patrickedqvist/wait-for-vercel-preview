const { rest } = require('msw');

const externalHandlers = [
  // Handles a POST /available request
  rest.get('https://example.com/available', function (req, res, ctx) {
    return res(ctx.status(200), ctx.json({ message: 'OK' }));
  }),

  // Handles a GET /forbbiden request
  rest.get('https://example.com/forbidden', function (req, res, ctx) {
    if (req.headers.get('x-vercel-protection-bypass') === 'A-BYPASS-TOKEN') {
      return res(ctx.status(200), ctx.json({ message: 'OK' }));
    }

    return res(ctx.status(401), ctx.json({ message: 'Forbidden' }));
  }),
];

module.exports = externalHandlers;
