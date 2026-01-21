interface HealthCheckOptions {
  /**
   * The URL to check
   */
  url: string;

  /**
   * Vercel secret to bypass deployment protection
   * see {@link https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation}
   */
  vercel_bypass_secret?: string;
}

async function getResource(request: RequestInfo) {
  const response = await fetch(request);
  if (!response.ok) {
    throw new Error(`Health check failed - response not OK, statusCode: ${response.statusText}`);
  }

  // Any status code that is not SUCCESS or a REDIRECT should be considered as a failure
  const statusCode = response.status;
  if (statusCode > 200 && statusCode < 302) {
    throw new Error(`Health check failed - statusCode: ${response.statusText}`);
  }

  return response;
}

export async function healthCheck({ url, vercel_bypass_secret }: HealthCheckOptions) {
  try {
    const headers = new Headers();

    // Add the necessary header in order to bypass the deployment protection of Vercel
    if (vercel_bypass_secret) {
      headers.append('x-vercel-protection-bypass', vercel_bypass_secret);
    }

    const request = new Request(url, {
      headers,
    });
    return await getResource(request);
  } catch (error) {
    console.log('Error in health check', error.message);
    throw error;
  }
}
