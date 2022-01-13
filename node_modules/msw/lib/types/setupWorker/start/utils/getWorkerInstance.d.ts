import { ServiceWorkerInstanceTuple, FindWorker } from '../../glossary';
/**
 * Returns an active Service Worker instance.
 * When not found, registers a new Service Worker.
 */
export declare const getWorkerInstance: (url: string, options: RegistrationOptions | undefined, findWorker: FindWorker) => Promise<ServiceWorkerInstanceTuple>;
