import { ServiceWorkerIncomingEventsMap, SetupWorkerInternalContext } from '../../setupWorker/glossary';
import { ServiceWorkerMessage } from '../createBroadcastChannel';
export declare function createResponseListener(context: SetupWorkerInternalContext): (_: MessageEvent, message: ServiceWorkerMessage<'RESPONSE', ServiceWorkerIncomingEventsMap['RESPONSE']>) => void;
