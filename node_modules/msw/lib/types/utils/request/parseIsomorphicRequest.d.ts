import { IsomorphicRequest } from '@mswjs/interceptors';
import { MockedRequest } from '../../handlers/RequestHandler';
/**
 * Converts a given isomorphic request to a `MockedRequest` instance.
 */
export declare function parseIsomorphicRequest(request: IsomorphicRequest): MockedRequest;
