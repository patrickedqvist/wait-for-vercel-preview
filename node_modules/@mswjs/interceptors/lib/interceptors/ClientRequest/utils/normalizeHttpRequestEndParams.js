"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHttpRequestEndParams = void 0;
var debug = require('debug')('http normalizeHttpRequestEndParams');
/**
 * Normalizes a list of arguments given to the `ClientRequest.end()`
 * method to always include `chunk`, `encoding`, and `callback`.
 * Returned values may be `null`.
 */
function normalizeHttpRequestEndParams() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    debug('arguments', args);
    var normalizedArgs = new Array(3)
        .fill(null)
        .map(function (value, index) { return args[index] || value; });
    normalizedArgs.sort(function (a, b) {
        // If first element is a function, move it rightwards.
        if (typeof a === 'function') {
            return 1;
        }
        // If second element is a function, move the first leftwards.
        if (typeof b === 'function') {
            return -1;
        }
        // If both elements are strings, preserve their original index.
        if (typeof a === 'string' && typeof b === 'string') {
            return normalizedArgs.indexOf(a) - normalizedArgs.indexOf(b);
        }
        return 0;
    });
    debug('normalized args', normalizedArgs);
    return normalizedArgs;
}
exports.normalizeHttpRequestEndParams = normalizeHttpRequestEndParams;
//# sourceMappingURL=normalizeHttpRequestEndParams.js.map