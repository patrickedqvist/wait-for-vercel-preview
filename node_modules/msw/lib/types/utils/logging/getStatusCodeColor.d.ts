export declare enum StatusCodeColor {
    Success = "#69AB32",
    Warning = "#F0BB4B",
    Danger = "#E95F5D"
}
/**
 * Returns a HEX color for a given response status code number.
 */
export declare function getStatusCodeColor(status: number): StatusCodeColor;
