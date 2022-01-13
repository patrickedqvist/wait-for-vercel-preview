import { GraphQLPayloadContext } from '../typeUtils';
/**
 * Sets a given payload as a GraphQL response body.
 * @example
 * res(ctx.data({ user: { firstName: 'John' }}))
 * @see {@link https://mswjs.io/docs/api/context/data `ctx.data()`}
 */
export declare const data: GraphQLPayloadContext<Record<string, unknown>>;
