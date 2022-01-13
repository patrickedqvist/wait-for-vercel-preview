import { StartOptions, SetupWorkerInternalContext, ServiceWorkerIncomingEventsMap } from '../../setupWorker/glossary';
import { ServiceWorkerMessage } from '../createBroadcastChannel';
import { RequiredDeep } from '../../typeUtils';
export declare const createRequestListener: (context: SetupWorkerInternalContext, options: RequiredDeep<StartOptions>) => (event: MessageEvent, message: ServiceWorkerMessage<'REQUEST', ServiceWorkerIncomingEventsMap['REQUEST']>) => Promise<void>;
