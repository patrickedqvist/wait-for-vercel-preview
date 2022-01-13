import { SetupWorkerApi } from './glossary';
import { RequestHandler } from '../handlers/RequestHandler';
/**
 * Creates a new mock Service Worker registration
 * with the given request handlers.
 * @param {RequestHandler[]} requestHandlers List of request handlers
 * @see {@link https://mswjs.io/docs/api/setup-worker `setupWorker`}
 */
export declare function setupWorker(...requestHandlers: RequestHandler[]): SetupWorkerApi;
