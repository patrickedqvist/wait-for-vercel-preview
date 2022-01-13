import { ResponseTransformer } from './response';
declare type Fn = (...arg: any[]) => any;
export declare type RequiredDeep<Type, U extends Record<string, unknown> | Fn | undefined = undefined> = Type extends Fn ? Type : Type extends Record<string, any> ? {
    [Key in keyof Type]-?: NonNullable<Type[Key]> extends NonNullable<U> ? NonNullable<Type[Key]> : RequiredDeep<NonNullable<Type[Key]>, U>;
} : Type;
export declare type GraphQLPayloadContext<QueryType extends Record<string, unknown>> = (payload: QueryType) => ResponseTransformer;
export {};
