export declare type Path = string | RegExp;
export declare type PathParams = Record<string, string | ReadonlyArray<string>>;
export interface Match {
    matches: boolean;
    params?: PathParams;
}
/**
 * Coerce a path supported by MSW into a path
 * supported by "path-to-regexp".
 */
export declare function coercePath(path: string): string;
/**
 * Returns the result of matching given request URL against a mask.
 */
export declare function matchRequestUrl(url: URL, path: Path, baseUrl?: string): Match;
