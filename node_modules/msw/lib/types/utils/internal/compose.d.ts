declare type ArityOneFunction = (arg: any) => any;
declare type LengthOfTuple<Tuple extends any[]> = Tuple extends {
    length: infer L;
} ? L : never;
declare type DropFirstInTuple<Tuple extends any[]> = ((...args: Tuple) => any) extends (arg: any, ...rest: infer LastArg) => any ? LastArg : Tuple;
declare type LastInTuple<Tuple extends any[]> = Tuple[LengthOfTuple<DropFirstInTuple<Tuple>>];
declare type FirstFnParameterType<Functions extends ArityOneFunction[]> = Parameters<LastInTuple<Functions>>[any];
declare type LastFnParameterType<Functions extends ArityOneFunction[]> = ReturnType<Functions[0]>;
/**
 * Composes a given list of functions into a new function that
 * executes from right to left.
 */
export declare function compose<Functions extends ArityOneFunction[], LeftReturnType extends FirstFnParameterType<Functions>, RightReturnType extends LastFnParameterType<Functions>>(...fns: Functions): (...args: [LeftReturnType] extends [never] ? never[] : [LeftReturnType]) => RightReturnType;
export {};
