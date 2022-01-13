import * as cookieUtils from 'cookie';
import { ResponseTransformer } from '../response';
/**
 * Sets a given cookie on the mocked response.
 * @example res(ctx.cookie('name', 'value'))
 */
export declare const cookie: (name: string, value: string, options?: cookieUtils.CookieSerializeOptions | undefined) => ResponseTransformer;
