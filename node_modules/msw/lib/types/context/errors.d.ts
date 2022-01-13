import { GraphQLError } from 'graphql';
import { ResponseTransformer } from '../response';
/**
 * Sets a given list of GraphQL errors on the mocked response.
 * @example res(ctx.errors([{ message: 'Unauthorized' }]))
 * @see {@link https://mswjs.io/docs/api/context/errors}
 */
export declare const errors: <ErrorsType extends readonly Partial<GraphQLError>[] | null | undefined>(errorsList: ErrorsType) => ResponseTransformer<string>;
