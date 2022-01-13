"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interceptClientRequest = void 0;
var http_1 = __importDefault(require("http"));
var https_1 = __importDefault(require("https"));
var createClientRequestOverride_1 = require("./createClientRequestOverride");
var debug = require('debug')('http override');
// Store a pointer to the original `http.ClientRequest` class
// so it can be mutated during runtime, affecting any subsequent calls.
var pureClientRequest;
function handleClientRequest(protocol, pureMethod, args, observer, resolver) {
    // The first time we execute this, I'll save the original ClientRequest.
    // This because is used to restore the dafault one later
    if (!pureClientRequest) {
        pureClientRequest = http_1.default.ClientRequest;
    }
    var ClientRequestOverride = createClientRequestOverride_1.createClientRequestOverride({
        defaultProtocol: protocol + ":",
        pureClientRequest: pureClientRequest,
        pureMethod: pureMethod,
        observer: observer,
        resolver: resolver,
    });
    debug('new ClientRequestOverride (origin: %s)', protocol);
    // @ts-expect-error Variable call signature.
    return new (ClientRequestOverride.bind.apply(ClientRequestOverride, __spreadArray([void 0], __read(args))))();
}
/**
 * Intercepts requests issued by native `http` and `https` modules.
 */
var interceptClientRequest = function (observer, resolver) {
    var pureModules = new Map();
    var modules = ['http', 'https'];
    modules.forEach(function (protocol) {
        var requestModule = protocol === 'https' ? https_1.default : http_1.default;
        var originalRequest = requestModule.request, originalGet = requestModule.get;
        // Wrap an original `http.request`/`https.request`
        // so that its invocations can be debugged.
        function proxiedOriginalRequest() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            debug('%s.request original call', protocol, args);
            // @ts-ignore
            return originalRequest.apply(void 0, __spreadArray([], __read(args)));
        }
        debug('patching "%s" module...', protocol);
        // @ts-ignore
        requestModule.request = function requestOverride() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            debug('%s.request proxy call', protocol);
            return handleClientRequest(protocol, proxiedOriginalRequest.bind(requestModule), args, observer, resolver);
        };
        // @ts-ignore
        requestModule.get = function getOverride() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            debug('%s.get call', protocol);
            var req = handleClientRequest(protocol, originalGet.bind(requestModule), args, observer, resolver);
            req.end();
            return req;
        };
        pureModules.set(protocol, {
            module: requestModule,
            request: originalRequest,
            get: originalGet,
        });
    });
    return function () {
        var e_1, _a;
        debug('restoring modules...');
        try {
            for (var _b = __values(pureModules.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var requestModule = _c.value;
                requestModule.module.get = requestModule.get;
                requestModule.module.request = requestModule.request;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        pureModules.clear();
    };
};
exports.interceptClientRequest = interceptClientRequest;
//# sourceMappingURL=index.js.map