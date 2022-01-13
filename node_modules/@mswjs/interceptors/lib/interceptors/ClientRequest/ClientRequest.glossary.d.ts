/// <reference types="node" />
import { IncomingMessage } from 'http';
export interface RequestSelf {
    uri?: URL;
}
export declare type HttpRequestCallback = (response: IncomingMessage) => void;
