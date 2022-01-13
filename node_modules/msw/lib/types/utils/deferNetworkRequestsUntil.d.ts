/**
 * Intercepts and defers any requests on the page
 * until the Service Worker instance is ready.
 * Must only be used in a browser.
 */
export declare function deferNetworkRequestsUntil(predicatePromise: Promise<any>): void;
