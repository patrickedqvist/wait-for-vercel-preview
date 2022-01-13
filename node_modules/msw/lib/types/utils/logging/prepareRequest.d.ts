import { MockedRequest } from '../../handlers/RequestHandler';
/**
 * Formats a mocked request for introspection in browser's console.
 */
export declare function prepareRequest(request: MockedRequest): {
    headers: Record<string, string>;
    id: string;
    url: URL;
    method: string;
    cookies: Record<string, string>;
    mode: RequestMode;
    keepalive: boolean;
    cache: RequestCache;
    destination: RequestDestination;
    integrity: string;
    credentials: RequestCredentials;
    redirect: RequestRedirect;
    referrer: string;
    referrerPolicy: ReferrerPolicy;
    body: import("../../handlers/RequestHandler").DefaultRequestBody;
    bodyUsed: boolean;
};
