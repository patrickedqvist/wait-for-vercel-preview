import { ResponseTransformer } from '../response';
/**
 * Sets a textual response body. Appends a `Content-Type: text/plain`
 * header on the mocked response.
 * @example res(ctx.text('Successful response'))
 * @see {@link https://mswjs.io/docs/api/context/text `ctx.text()`}
 */
export declare const text: <BodyType extends string>(body: BodyType) => ResponseTransformer<BodyType, any>;
