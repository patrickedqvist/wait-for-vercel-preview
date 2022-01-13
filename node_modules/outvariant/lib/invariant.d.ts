export declare class InvariantError extends Error {
    constructor(message: string, ...positionals: any[]);
}
export declare function invariant<T>(predicate: T, message: string, ...positionals: any[]): asserts predicate;
