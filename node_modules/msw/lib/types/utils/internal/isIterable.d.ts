/**
 * Determines if the given function is an iterator.
 */
export declare function isIterable<IteratorType>(fn: any): fn is Generator<IteratorType, IteratorType, IteratorType>;
