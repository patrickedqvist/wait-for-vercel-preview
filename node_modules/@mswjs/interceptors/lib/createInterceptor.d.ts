/// <reference types="node" />
import { IncomingMessage } from 'http';
import { HeadersObject, Headers } from 'headers-utils';
import { StrictEventEmitter } from 'strict-event-emitter';
export declare type Interceptor = (observer: Observer, resolver: Resolver) => InterceptorCleanupFn;
export declare type Observer = StrictEventEmitter<InterceptorEventsMap>;
/**
 * A side-effect function to restore all the patched modules.
 */
export declare type InterceptorCleanupFn = () => void;
export interface IsomorphicRequest {
    id: string;
    url: URL;
    method: string;
    headers: Headers;
    body?: string;
}
export interface IsomorphicResponse {
    status: number;
    statusText: string;
    headers: Headers;
    body?: string;
}
export interface MockedResponse extends Omit<Partial<IsomorphicResponse>, 'headers'> {
    headers?: HeadersObject;
}
export interface InterceptorEventsMap {
    request(request: IsomorphicRequest): void;
    response(request: IsomorphicRequest, response: IsomorphicResponse): void;
}
export declare type Resolver = (request: IsomorphicRequest, ref: IncomingMessage | XMLHttpRequest | Request) => MockedResponse | Promise<MockedResponse | void> | void;
export interface InterceptorOptions {
    modules: Interceptor[];
    resolver: Resolver;
}
export interface InterceptorApi {
    /**
     * Apply necessary module patches to provision the interception of requests.
     */
    apply(): void;
    on<Event extends keyof InterceptorEventsMap>(event: Event, listener: InterceptorEventsMap[Event]): void;
    /**
     * Restore all applied module patches and disable the interception.
     */
    restore(): void;
}
export declare function createInterceptor(options: InterceptorOptions): InterceptorApi;
