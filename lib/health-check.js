import * as core from '@actions/core';
import axios from 'axios';

/**
 * Request specified URL and continue to retry until a 200 response is received
 * @param {string} url URL to request
 * @param {string} bypassSecret Vercel secret to bypass the preview protection (https://vercel.com/docs/security/deployment-protection#protection-bypass-for-automation)
 * @param {string} path Relative path to append to URL
 */
export async function healthCheck({ url, bypassSecret, path }) {
  const config = {};

  // If the bypass secret is provided, add it as a header
  // @docs https://vercel.com/docs/security/deployment-protection#protection-bypass-for-automation
  if (bypassSecret) {
    config.headers['x-vercel-protection-bypass'] = bypassSecret;
    core.debug('health check › protection bypass is added');
  }

  const requestUrl = new URL(path, url);
  return axios.get(requestUrl.toString(), config);
}
