import { GraphQLPayloadContext } from '../typeUtils';
/**
 * Sets the GraphQL extensions on a given response.
 * @example
 * res(ctx.extensions({ tracing: { version: 1 }}))
 * @see {@link https://mswjs.io/docs/api/context/extensions `ctx.extensions()`}
 */
export declare const extensions: GraphQLPayloadContext<Record<string, unknown>>;
