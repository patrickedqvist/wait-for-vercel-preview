"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interceptXMLHttpRequest = void 0;
var XMLHttpRequestOverride_1 = require("./XMLHttpRequestOverride");
var debug = require('debug')('XHR');
var pureXMLHttpRequest = 
// Although executed in node, certain processes emulate the DOM-like environment
// (i.e. `js-dom` in Jest). The `window` object would be avilable in such environments.
typeof window === 'undefined' ? undefined : window.XMLHttpRequest;
/**
 * Intercepts requests issued via `XMLHttpRequest`.
 */
var interceptXMLHttpRequest = function (observer, resolver) {
    if (pureXMLHttpRequest) {
        debug('patching "XMLHttpRequest" module...');
        var XMLHttpRequestOverride = XMLHttpRequestOverride_1.createXMLHttpRequestOverride({
            pureXMLHttpRequest: pureXMLHttpRequest,
            observer: observer,
            resolver: resolver,
        });
        window.XMLHttpRequest = XMLHttpRequestOverride;
    }
    return function () {
        if (pureXMLHttpRequest) {
            debug('restoring modules...');
            window.XMLHttpRequest = pureXMLHttpRequest;
        }
    };
};
exports.interceptXMLHttpRequest = interceptXMLHttpRequest;
//# sourceMappingURL=index.js.map