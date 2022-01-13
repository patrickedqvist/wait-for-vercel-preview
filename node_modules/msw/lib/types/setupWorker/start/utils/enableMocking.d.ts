import { StartOptions, SetupWorkerInternalContext } from '../../glossary';
/**
 * Signals the worker to enable the interception of requests.
 */
export declare function enableMocking(context: SetupWorkerInternalContext, options: StartOptions): Promise<void>;
