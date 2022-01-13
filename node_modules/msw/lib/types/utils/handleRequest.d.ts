import { StrictEventEmitter } from 'strict-event-emitter';
import { MockedRequest, RequestHandler } from '../handlers/RequestHandler';
import { ServerLifecycleEventsMap } from '../node/glossary';
import { MockedResponse } from '../response';
import { SharedOptions } from '../sharedOptions';
import { RequiredDeep } from '../typeUtils';
import { ResponseLookupResult } from './getResponse';
export interface HandleRequestOptions<ResponseType> {
    /**
     * Options for the response resolution process.
     */
    resolutionContext?: {
        baseUrl?: string;
    };
    /**
     * Transforms a `MockedResponse` instance returned from a handler
     * to a response instance supported by the lower tooling (i.e. interceptors).
     */
    transformResponse?(response: MockedResponse<string>): ResponseType;
    /**
     * Invoked whenever returning a bypassed (as-is) response.
     */
    onBypassResponse?(request: MockedRequest): void;
    /**
     * Invoked when the mocked response is ready to be sent.
     */
    onMockedResponse?(response: ResponseType, handler: RequiredDeep<ResponseLookupResult>): void;
    /**
     * Invoked when the mocked response is sent.
     * Respects the response delay duration.
     */
    onMockedResponseSent?(response: ResponseType, handler: RequiredDeep<ResponseLookupResult>): void;
}
export declare function handleRequest<ResponseType extends Record<string, any> = MockedResponse<string>>(request: MockedRequest, handlers: RequestHandler[], options: RequiredDeep<SharedOptions>, emitter: StrictEventEmitter<ServerLifecycleEventsMap>, handleRequestOptions?: HandleRequestOptions<ResponseType>): Promise<ResponseType | undefined>;
