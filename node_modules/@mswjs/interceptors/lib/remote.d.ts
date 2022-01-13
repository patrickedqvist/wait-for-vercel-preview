/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { InterceptorApi, InterceptorOptions, Resolver } from './createInterceptor';
export declare type CreateRemoteInterceptorOptions = Omit<InterceptorOptions, 'resolver'>;
export declare type RemoteResolverApi = Pick<InterceptorApi, 'on'>;
export interface CreateRemoteResolverOptions {
    process: ChildProcess;
    resolver: Resolver;
}
/**
 * Creates a remote request interceptor that delegates
 * the mocked response resolution to the parent process.
 * The parent process must establish a remote resolver
 * by calling `createRemoteResolver` function.
 */
export declare function createRemoteInterceptor(options: CreateRemoteInterceptorOptions): InterceptorApi;
/**
 * Creates a response resolver function attached to the given `ChildProcess`.
 * The child process must establish a remote interceptor by calling `createRemoteInterceptor` function.
 */
export declare function createRemoteResolver(options: CreateRemoteResolverOptions): RemoteResolverApi;
