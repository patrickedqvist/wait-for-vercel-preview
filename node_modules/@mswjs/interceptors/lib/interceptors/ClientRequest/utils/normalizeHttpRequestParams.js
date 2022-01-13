"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHttpRequestParams = void 0;
var getRequestOptionsByUrl_1 = require("../../../utils/getRequestOptionsByUrl");
var getUrlByRequestOptions_1 = require("../../../utils/getUrlByRequestOptions");
var cloneObject_1 = require("../../../utils/cloneObject");
var isObject_1 = require("../../../utils/isObject");
var debug = require('debug')('http normalizeHttpRequestParams');
function resolveRequestOptions(args, url) {
    // Calling `fetch` provides only URL to `ClientRequest`
    // without any `RequestOptions` or callback.
    if (typeof args[1] === 'undefined' || typeof args[1] === 'function') {
        debug('request options not provided, deriving from the url', url);
        return getRequestOptionsByUrl_1.getRequestOptionsByUrl(url);
    }
    if (args[1]) {
        /**
         * Clone the request options to lock their state
         * at the moment they are provided to `ClientRequest`.
         * @see https://github.com/mswjs/interceptors/issues/86
         */
        debug('request options exist, cloning...');
        return cloneObject_1.cloneObject(args[1]);
    }
    debug('using an empty object as request options');
    return {};
}
function resolveCallback(args) {
    return typeof args[1] === 'function' ? args[1] : args[2];
}
/**
 * Normalizes parameters given to a `http.request` call
 * so it always has a `URL` and `RequestOptions`.
 */
function normalizeHttpRequestParams(defaultProtocol) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var url;
    var options;
    var callback;
    debug('arguments', args);
    debug('default protocol', defaultProtocol);
    // Convert a url string into a URL instance
    // and derive request options from it.
    if (typeof args[0] === 'string') {
        debug('given a location string:', args[0]);
        url = new URL(args[0]);
        debug('created a URL:', url);
        options = resolveRequestOptions(args, url);
        debug('created request options:', options);
        callback = resolveCallback(args);
    }
    // Handle a given URL instance as-is
    // and derive request options from it.
    else if (args[0] instanceof URL) {
        url = args[0];
        debug('given a URL:', url);
        options = resolveRequestOptions(args, url);
        debug('created request options', options);
        callback = resolveCallback(args);
    }
    // Handle a legacy URL instance and re-normalize from either a RequestOptions object
    // or a WHATWG URL.
    else if ('hash' in args[0] && !('method' in args[0])) {
        var _a = __read(args, 1), legacyUrl = _a[0];
        if (legacyUrl.hostname === null) {
            // We are dealing with a relative url, so use the path as an "option" and
            // merge in any existing options, giving priority to exising options -- i.e. a path in any
            // existing options will take precedence over the one contained in the url. This is consistent
            // with the behaviour in ClientRequest.
            // https://github.com/nodejs/node/blob/d84f1312915fe45fe0febe888db692c74894c382/lib/_http_client.js#L122
            debug('given a relative legacy URL:', legacyUrl);
            return isObject_1.isObject(args[1])
                ? normalizeHttpRequestParams(defaultProtocol, __assign({ path: legacyUrl.path }, args[1]), args[2])
                : normalizeHttpRequestParams(defaultProtocol, { path: legacyUrl.path }, args[1]);
        }
        debug('given an absolute legacy url:', legacyUrl);
        // We are dealing with an absolute URL, so convert to WHATWG and try again.
        var resolvedUrl = new URL(legacyUrl.href);
        return args[1] === undefined
            ? normalizeHttpRequestParams(defaultProtocol, resolvedUrl)
            : typeof args[1] === 'function'
                ? normalizeHttpRequestParams(defaultProtocol, resolvedUrl, args[1])
                : normalizeHttpRequestParams(defaultProtocol, resolvedUrl, args[1], args[2]);
    }
    // Handle a given RequestOptions object as-is
    // and derive the URL instance from it.
    else if (isObject_1.isObject(args[0])) {
        options = args[0];
        debug('given request options:', options);
        // When handling a `RequestOptions` object without an explicit "protocol",
        // infer the protocol from the request issuing module (http/https).
        options.protocol = options.protocol || defaultProtocol;
        debug('normalized request options:', options);
        url = getUrlByRequestOptions_1.getUrlByRequestOptions(options);
        debug('created a URL:', url);
        callback = resolveCallback(args);
    }
    else {
        throw new Error("Failed to construct ClientRequest with these parameters: " + args);
    }
    // Enforce protocol on `RequestOptions` so when `ClientRequest` compares
    // the agent protocol to the request options protocol they match.
    // @see https://github.com/nodejs/node/blob/d84f1312915fe45fe0febe888db692c74894c382/lib/_http_client.js#L142-L145
    // This prevents `Protocol "http:" not supported. Expected "https:"` exception for `https.request` calls.
    options.protocol = options.protocol || url.protocol;
    options.method = options.method || 'GET';
    debug('resolved URL:', url);
    debug('resolved options:', options);
    return [url, options, callback];
}
exports.normalizeHttpRequestParams = normalizeHttpRequestParams;
//# sourceMappingURL=normalizeHttpRequestParams.js.map