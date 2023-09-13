const calculateIterations = require('./calculate-iterations');
const core = require('@actions/core');
const axios = require('axios');
const wait = require('./wait');

/**
 * Request specified URL and continue to retry until a 200 response is received
 * @param {string} url URL to request
 * @param {number} maxTimeout Maximum number of seconds to wait before timing out
 * @param {number} checkIntervalInMilliseconds Number of milliseconds to wait between requests
 * @param {string} bypassSecret Vercel secret to bypass the preview protection (https://vercel.com/docs/security/deployment-protection#protection-bypass-for-automation)
 * @param {string} path Relative path to append to URL
 */
async function healthCheck({
  url,
  maxTimeout,
  checkIntervalInMilliseconds,
  bypassSecret,
  path,
}) {
  core.info(`health check › Performing health check against ${url}`);

  // Calculate the number of iterations to perform
  const iterations = calculateIterations(
    maxTimeout,
    checkIntervalInMilliseconds
  );

  // Loop through each iteration, waiting for the specified interval between each request
  for (let i = 0; i < iterations; i++) {

    try {
      // If the bypass secret is provided, add it as a header
      // @docs https://vercel.com/docs/security/deployment-protection#protection-bypass-for-automation
      const config = {
        headers: {},
      };

      if (bypassSecret) {
        config.headers['x-vercel-protection-bypass'] = bypassSecret;
      }

      const requestUrl = new URL(path, url);
      core.debug(
        `health check › requesting url with the following url: ${requestUrl.toString()}`
      );
      core.debug(
        `health check › requesting url with the following config: ${JSON.stringify(
          config,
          null,
          2
        )}`
      );
      await axios.get(requestUrl.toString(), config);
      core.info('health check › Received success status code');
      return;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          // Exit early with a failure since continued attempts will not succeed
          core.setFailed(
            'Could not access the given URL. Consider adding a bypass secret. See https://vercel.com/docs/security/deployment-protection#protection-bypass-for-automation for documentation.'
          );
        } else {
          core.info(
            `health check › received status code ${error.response.status}. Attempt ${i} of ${iterations}`
          );
        }
        return;
      } else if (axios.isAxiosError(error) && error.request) {
        core.info(
          `health check › A request was made, but no response was received. Attempt ${i} of ${iterations}`
        );
        core.debug(
          `health check › The following error message was received: ${error.message}`
        );
        core.info(`health check › retrying (attempt ${i + 1} / ${iterations}`)
        await wait(checkIntervalInMilliseconds);
        return;
      } else if (error instanceof Error) {
        core.info(
          `health check › An error occurred with the following message: ${error.message}`
        );
        await wait(checkIntervalInMilliseconds);
        return;
      }
    }
  }

  core.setFailed(`health check › Timeout reached: Unable to connect to ${url}`);
}

module.exports = healthCheck;
