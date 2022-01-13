import { MockedRequest } from '../../handlers/RequestHandler';
/**
 * Returns a relative URL if the given request URL is relative to the current origin.
 * Otherwise returns an absolute URL.
 */
export declare const getPublicUrlFromRequest: (request: MockedRequest) => string;
