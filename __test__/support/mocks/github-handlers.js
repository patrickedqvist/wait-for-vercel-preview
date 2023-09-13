const { rest } = require('msw');

const deploymentStatusesFixtures = require('../../fixtures/list-deployment-statuses.json')

const githubHandlers = [
  rest.get("https://api.github.com/repos/:owner/:repo/deployments/:id/statuses", function (req, res, ctx) {

    // If the deployment id is 20, then we want to return a filtered list of statuses
    // which is used to test different scenarios
    if (req.params.id === "20") {
      const filteredStatuses = deploymentStatusesFixtures.filter((status) => {
        return status.state === "in_progress";
      });
      return res(ctx.status(200), ctx.json(filteredStatuses));
    }

    return res(ctx.status(200), ctx.json(deploymentStatusesFixtures));
  }),
]

module.exports = githubHandlers;