import { MockedResponse } from '../response';
import { MockedRequest, RequestHandler } from '../handlers/RequestHandler';
export interface ResponseLookupResult {
    handler?: RequestHandler;
    publicRequest?: any;
    parsedRequest?: any;
    response?: MockedResponse;
}
export interface ResponseResolutionContext {
    baseUrl?: string;
}
/**
 * Returns a mocked response for a given request using following request handlers.
 */
export declare const getResponse: <Request_1 extends MockedRequest<import("../handlers/RequestHandler").DefaultRequestBody>, Handler extends RequestHandler<import("../handlers/RequestHandler").RequestHandlerDefaultInfo, MockedRequest<import("../handlers/RequestHandler").DefaultRequestBody>, any, MockedRequest<import("../handlers/RequestHandler").DefaultRequestBody>>[]>(request: Request_1, handlers: Handler, resolutionContext?: ResponseResolutionContext | undefined) => Promise<ResponseLookupResult>;
