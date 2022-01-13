/// <reference types="node" />
import { RequestOptions } from 'https';
import { EventEmitter } from 'events';
interface SocketOptions {
    usesHttps: boolean;
}
export declare class SocketPolyfill extends EventEmitter {
    authorized?: boolean;
    bufferSize: number;
    writableLength: number;
    writable: boolean;
    readable: boolean;
    pending: boolean;
    destroyed: boolean;
    connecting: boolean;
    totalDelayMs: number;
    timeoutMs: number | null;
    remoteFamily: 'IPv4' | 'IPv6';
    localAddress: string;
    localPort: number;
    remoteAddress: string;
    remotePort: number;
    constructor(options: RequestOptions, socketOptions: SocketOptions);
    resolvePort(port: RequestOptions['port']): number;
    address(): {
        port: number;
        family: "IPv4" | "IPv6";
        address: string;
    };
    applyDelay(duration: number): void;
    /**
     * Enable/disable the use of Nagle's algorithm.
     * Nagle's algorithm delays data before it is sent via the network.
     */
    setNoDelay(noDelay?: boolean): SocketPolyfill;
    /**
     * Enable/disable keep-alive functionality, and optionally set the initial delay before
     * the first keepalive probe is sent on an idle socket.
     */
    setKeepAlive(): SocketPolyfill;
    setTimeout(timeout: number, callback?: () => void): SocketPolyfill;
    getPeerCertificate(): string;
    pause(): SocketPolyfill;
    resume(): SocketPolyfill;
    cork(): void;
    uncork(): void;
    destroy(error: Error): this;
}
export {};
