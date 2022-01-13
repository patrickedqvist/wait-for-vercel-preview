import { RequiredDeep } from '../../../typeUtils';
import { SetupWorkerApi, SetupWorkerInternalContext, StartHandler, StartOptions } from '../../glossary';
export declare const DEFAULT_START_OPTIONS: RequiredDeep<StartOptions>;
/**
 * Returns resolved worker start options, merging the default options
 * with the given custom options.
 */
export declare function resolveStartOptions(initialOptions?: StartOptions): RequiredDeep<StartOptions>;
export declare function prepareStartHandler(handler: StartHandler, context: SetupWorkerInternalContext): SetupWorkerApi['start'];
