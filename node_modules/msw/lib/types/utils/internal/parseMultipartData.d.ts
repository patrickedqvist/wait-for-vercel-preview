import { DefaultRequestMultipartBody } from '../../handlers/RequestHandler';
/**
 * Parses a given string as a multipart/form-data.
 * Does not throw an exception on an invalid multipart string.
 */
export declare function parseMultipartData<T extends DefaultRequestMultipartBody>(data: string, headers?: Headers): T | undefined;
