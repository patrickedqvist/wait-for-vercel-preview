import { ResponseTransformer } from '../response';
/**
 * Sets a response status code and text.
 * @example
 * res(ctx.status(301))
 * res(ctx.status(400, 'Custom status text'))
 * @see {@link https://mswjs.io/docs/api/context/status `ctx.status()`}
 */
export declare const status: (statusCode: number, statusText?: string | undefined) => ResponseTransformer;
