import { RequestHandler } from '../../handlers/RequestHandler';
export declare function use(currentHandlers: RequestHandler[], ...handlers: RequestHandler[]): void;
export declare function restoreHandlers(handlers: RequestHandler[]): void;
export declare function resetHandlers(initialHandlers: RequestHandler[], ...nextHandlers: RequestHandler[]): RequestHandler<import("../../handlers/RequestHandler").RequestHandlerDefaultInfo, import("../../handlers/RequestHandler").MockedRequest<import("../../handlers/RequestHandler").DefaultRequestBody>, any, import("../../handlers/RequestHandler").MockedRequest<import("../../handlers/RequestHandler").DefaultRequestBody>>[];
