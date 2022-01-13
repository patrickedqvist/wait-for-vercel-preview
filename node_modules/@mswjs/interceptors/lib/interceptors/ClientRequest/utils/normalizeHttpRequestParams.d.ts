/// <reference types="node" />
import { RequestOptions } from 'https';
import { Url as LegacyURL } from 'url';
import { HttpRequestCallback, RequestSelf } from '../ClientRequest.glossary';
declare type HttpRequestArgs = [string | URL | LegacyURL, HttpRequestCallback?] | [string | URL | LegacyURL, RequestOptions, HttpRequestCallback?] | [RequestOptions, HttpRequestCallback?];
/**
 * Normalizes parameters given to a `http.request` call
 * so it always has a `URL` and `RequestOptions`.
 */
export declare function normalizeHttpRequestParams(defaultProtocol: string, ...args: HttpRequestArgs): [URL, RequestOptions & RequestSelf, HttpRequestCallback?];
export {};
