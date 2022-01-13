import { FindWorker } from '../../glossary';
/**
 * Attempts to resolve a Service Worker instance from a given registration,
 * regardless of its state (active, installing, waiting).
 */
export declare const getWorkerByRegistration: (registration: ServiceWorkerRegistration, absoluteWorkerUrl: string, findWorker: FindWorker) => ServiceWorker | null;
