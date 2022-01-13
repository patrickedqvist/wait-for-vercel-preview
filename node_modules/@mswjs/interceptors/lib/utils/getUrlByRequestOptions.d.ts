/// <reference types="node" />
import { RequestOptions } from 'https';
import { RequestSelf } from '../interceptors/ClientRequest/ClientRequest.glossary';
declare type IsomorphicClientRequestOptions = RequestOptions & RequestSelf;
export declare const DEFAULT_PATH = "/";
/**
 * Creates a `URL` instance from a given `RequestOptions` object.
 */
export declare function getUrlByRequestOptions(options: IsomorphicClientRequestOptions): URL;
export {};
