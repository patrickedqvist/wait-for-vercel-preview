import { ServiceWorkerIncomingRequest } from '../../setupWorker/glossary';
declare type Input = Pick<ServiceWorkerIncomingRequest, 'method' | 'body'>;
/**
 * Ensures that an empty GET request body is always represented as `undefined`.
 */
export declare function pruneGetRequestBody(request: Input): ServiceWorkerIncomingRequest['body'];
export {};
