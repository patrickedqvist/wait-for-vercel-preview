import { Interceptor } from '@mswjs/interceptors';
import { SetupServerApi } from './glossary';
import { RequestHandler } from '../handlers/RequestHandler';
/**
 * Creates a `setupServer` API using given request interceptors.
 * Useful to generate identical API using different patches to request issuing modules.
 */
export declare function createSetupServer(...interceptors: Interceptor[]): (...requestHandlers: RequestHandler[]) => SetupServerApi;
