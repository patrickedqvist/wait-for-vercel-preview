import { InterceptorApi } from '@mswjs/interceptors';
import { SetupWorkerInternalContext, StartOptions } from '../../setupWorker/glossary';
import { RequiredDeep } from '../../typeUtils';
export declare function createFallbackRequestListener(context: SetupWorkerInternalContext, options: RequiredDeep<StartOptions>): InterceptorApi;
