/**
 * Formats a given message by appending the library's prefix string.
 */
declare function formatMessage(message: string, ...positionals: any[]): string;
/**
 * Prints a library-specific warning.
 */
declare function warn(message: string, ...positionals: any[]): void;
/**
 * Prints a library-specific error.
 */
declare function error(message: string, ...positionals: any[]): void;
export declare const devUtils: {
    formatMessage: typeof formatMessage;
    warn: typeof warn;
    error: typeof error;
};
export {};
