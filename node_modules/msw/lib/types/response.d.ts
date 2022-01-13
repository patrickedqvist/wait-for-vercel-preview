import { Headers } from 'headers-utils';
/**
 * Internal representation of a mocked response instance.
 */
export interface MockedResponse<BodyType = any> {
    body: BodyType;
    status: number;
    statusText: string;
    headers: Headers;
    once: boolean;
    delay?: number;
}
export declare type ResponseTransformer<BodyType extends TransformerBodyType = any, TransformerBodyType = any> = (res: MockedResponse<TransformerBodyType>) => MockedResponse<BodyType> | Promise<MockedResponse<BodyType>>;
export declare type ResponseFunction<BodyType = any> = (...transformers: ResponseTransformer<BodyType>[]) => MockedResponse<BodyType> | Promise<MockedResponse<BodyType>>;
export declare type ResponseComposition<BodyType = any> = ResponseFunction<BodyType> & {
    /**
     * Respond using a given mocked response to the first captured request.
     * Does not affect any subsequent captured requests.
     */
    once: ResponseFunction<BodyType>;
    networkError: (message: string) => void;
};
export declare const defaultResponse: Omit<MockedResponse, 'headers'>;
export declare type ResponseCompositionOptions<BodyType> = {
    defaultTransformers?: ResponseTransformer<BodyType>[];
    mockedResponseOverrides?: Partial<MockedResponse>;
};
export declare const defaultResponseTransformers: ResponseTransformer<any>[];
export declare function createResponseComposition<BodyType>(responseOverrides?: Partial<MockedResponse<BodyType>>, defaultTransformers?: ResponseTransformer<BodyType>[]): ResponseFunction;
export declare const response: ResponseFunction<any> & {
    once: ResponseFunction<any>;
    networkError(message: string): never;
};
