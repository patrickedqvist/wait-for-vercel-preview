import { body, cookie, delay, fetch, json, set, status, text, xml } from '../context';
import { SerializedResponse } from '../setupWorker/glossary';
import { ResponseResolutionContext } from '../utils/getResponse';
import { Match, Path, PathParams } from '../utils/matching/matchRequestUrl';
import { DefaultRequestBody, MockedRequest, RequestHandler, RequestHandlerDefaultInfo, ResponseResolver } from './RequestHandler';
declare type RestHandlerMethod = string | RegExp;
export interface RestHandlerInfo extends RequestHandlerDefaultInfo {
    method: RestHandlerMethod;
    path: Path;
}
export declare enum RESTMethods {
    HEAD = "HEAD",
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    OPTIONS = "OPTIONS",
    DELETE = "DELETE"
}
export declare type RestContext = {
    set: typeof set;
    status: typeof status;
    cookie: typeof cookie;
    text: typeof text;
    body: typeof body;
    json: typeof json;
    xml: typeof xml;
    delay: typeof delay;
    fetch: typeof fetch;
};
export declare const restContext: RestContext;
export declare type RequestQuery = {
    [queryName: string]: string;
};
export interface RestRequest<BodyType extends DefaultRequestBody = DefaultRequestBody, ParamsType extends PathParams = PathParams> extends MockedRequest<BodyType> {
    params: ParamsType;
}
export declare type ParsedRestRequest = Match;
/**
 * Request handler for REST API requests.
 * Provides request matching based on method and URL.
 */
export declare class RestHandler<RequestType extends MockedRequest<DefaultRequestBody> = MockedRequest<DefaultRequestBody>> extends RequestHandler<RestHandlerInfo, RequestType, ParsedRestRequest, RestRequest<RequestType extends MockedRequest<infer RequestBodyType> ? RequestBodyType : any, PathParams>> {
    constructor(method: RestHandlerMethod, path: Path, resolver: ResponseResolver<any, any>);
    private checkRedundantQueryParameters;
    parse(request: RequestType, resolutionContext?: ResponseResolutionContext): Match;
    protected getPublicRequest(request: RequestType, parsedResult: ParsedRestRequest): RestRequest<any, PathParams>;
    predicate(request: RequestType, parsedResult: ParsedRestRequest): boolean;
    log(request: RequestType, response: SerializedResponse): void;
}
export {};
