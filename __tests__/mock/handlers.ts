import { http, HttpResponse } from 'msw';
import ListDeploymentsResponse from './fixtures/list-deployments.json';
import ListDeploymentStatusesResponse from './fixtures/list-deployment-statuses.json';

const ApiUrl = 'https://api.github.com/repos/:owner/:repo';
const PreviewUrl = 'https://example.com/deployment/42/output';

export const handlers = [
  http.get(`${ApiUrl}/deployments`, async ({ params, request }) => {
    const url = new URL(request.url);

    const data = ListDeploymentsResponse
      // Filter by SHA
      .filter((f) => f.sha === url.searchParams.get('sha'))
      // Filter by environment
      .filter((f) => f.environment === url.searchParams.get('environment'));

    return HttpResponse.json(data);
  }),
  http.get(`${ApiUrl}/deployments/:deploymentId/statuses`, async ({ params }) => {
    const data = ListDeploymentStatusesResponse
      // Filter by ID
      .filter((s) => s.id === Number(params.deploymentId));

    return HttpResponse.json(data);
  }),
  http.get(PreviewUrl, () => {
    return HttpResponse.json({ message: 'Hello, world!' });
  }),
  http.get(`${PreviewUrl}/protected`, async ({ request }) => {
    const headers = request.headers;

    if (!headers.get('x-vercel-protection-bypass')) {
      return new HttpResponse('Unauthorized', {
        status: 401,
      });
    } else if (headers.get('x-vercel-protection-bypass') !== 'my-secret-bypass-token') {
      return new HttpResponse('Unauthorized', {
        status: 403,
      });
    }

    return HttpResponse.json({ message: 'Hello, world!' });
  }),
];
