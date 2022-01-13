/// <reference types="node" />
declare type HttpRequestEndChunk = string | Buffer;
declare type HttpRequestEndEncoding = string;
declare type HttpRequestEndCallback = () => void;
declare type HttpRequestEndArgs = [] | [HttpRequestEndCallback] | [HttpRequestEndChunk, HttpRequestEndCallback?] | [HttpRequestEndChunk, HttpRequestEndEncoding, HttpRequestEndCallback?];
declare type NormalizedHttpRequestEndParams = [
    HttpRequestEndChunk | null,
    HttpRequestEndEncoding | null,
    HttpRequestEndCallback | null
];
/**
 * Normalizes a list of arguments given to the `ClientRequest.end()`
 * method to always include `chunk`, `encoding`, and `callback`.
 * Returned values may be `null`.
 */
export declare function normalizeHttpRequestEndParams(...args: HttpRequestEndArgs): NormalizedHttpRequestEndParams;
export {};
