import { MockedRequest } from '../../handlers/RequestHandler';
/**
 * Returns relevant document cookies based on the request `credentials` option.
 */
export declare function getRequestCookies(request: MockedRequest): {
    [key: string]: string;
};
