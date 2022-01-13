/**
 * Sets up a requests interception in Node.js with the given request handlers.
 * @param {RequestHandler[]} requestHandlers List of request handlers.
 * @see {@link https://mswjs.io/docs/api/setup-server `setupServer`}
 */
export declare const setupServer: (...requestHandlers: import("..").RequestHandler<import("../handlers/RequestHandler").RequestHandlerDefaultInfo, import("..").MockedRequest<import("..").DefaultRequestBody>, any, import("..").MockedRequest<import("..").DefaultRequestBody>>[]) => import("./glossary").SetupServerApi;
