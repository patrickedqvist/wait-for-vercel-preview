import { MockedRequest } from '../handlers/RequestHandler';
export declare const augmentRequestInit: (requestInit: RequestInit) => RequestInit;
/**
 * Performs a bypassed request inside a request handler.
 * @example
 * const originalResponse = await ctx.fetch(req)
 * @see {@link https://mswjs.io/docs/api/context/fetch `ctx.fetch()`}
 */
export declare const fetch: (input: string | MockedRequest, requestInit?: RequestInit) => Promise<Response>;
