import { RestRequest } from '../../handlers/RestHandler';
import { ServiceWorkerIncomingRequest } from '../../setupWorker/glossary';
/**
 * Converts a given request received from the Service Worker
 * into a `MockedRequest` instance.
 */
export declare function parseWorkerRequest(rawRequest: ServiceWorkerIncomingRequest): RestRequest;
