/**
 * Parses a given value into a JSON.
 * Does not throw an exception on an invalid JSON string.
 */
export declare function jsonParse<ValueType extends Record<string, any>>(value: any): ValueType | undefined;
