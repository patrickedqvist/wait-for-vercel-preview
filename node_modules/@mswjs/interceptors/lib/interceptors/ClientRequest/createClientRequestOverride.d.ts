/// <reference types="node" />
import http from 'http';
import { Observer, Resolver } from '../../createInterceptor';
interface CreateClientRequestOverrideOptions {
    defaultProtocol: string;
    pureClientRequest: typeof http.ClientRequest;
    pureMethod: typeof http.get | typeof http.request;
    observer: Observer;
    resolver: Resolver;
}
export declare function createClientRequestOverride(options: CreateClientRequestOverrideOptions): (this: http.ClientRequest, url: string | import("url").URL, options: http.RequestOptions, callback?: ((res: http.IncomingMessage) => void) | undefined) => http.ClientRequest;
export {};
