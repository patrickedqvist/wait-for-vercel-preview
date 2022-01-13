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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interceptFetch = void 0;
var headers_utils_1 = require("headers-utils");
var toIsoResponse_1 = require("../../utils/toIsoResponse");
var uuid_1 = require("../../utils/uuid");
var debug = require('debug')('fetch');
var interceptFetch = function (observer, resolver) {
    var pureFetch = window.fetch;
    debug('replacing "window.fetch"...');
    window.fetch = function (input, init) { return __awaiter(void 0, void 0, void 0, function () {
        var ref, url, method, isoRequest, response, isomorphicResponse;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ref = new Request(input, init);
                    url = typeof input === 'string' ? input : input.url;
                    method = (init === null || init === void 0 ? void 0 : init.method) || 'GET';
                    debug('[%s] %s', method, url);
                    _a = {
                        id: uuid_1.uuidv4(),
                        url: new URL(url, location.origin),
                        method: method,
                        headers: new headers_utils_1.Headers((init === null || init === void 0 ? void 0 : init.headers) || {})
                    };
                    return [4 /*yield*/, ref.text()];
                case 1:
                    isoRequest = (_a.body = _b.sent(),
                        _a);
                    debug('isomorphic request', isoRequest);
                    observer.emit('request', isoRequest);
                    debug('awaiting for the mocked response...');
                    return [4 /*yield*/, resolver(isoRequest, ref)];
                case 2:
                    response = _b.sent();
                    debug('mocked response', response);
                    if (response) {
                        isomorphicResponse = toIsoResponse_1.toIsoResponse(response);
                        debug('derived isomorphic response', isomorphicResponse);
                        observer.emit('response', isoRequest, isomorphicResponse);
                        return [2 /*return*/, new Response(response.body, __assign(__assign({}, isomorphicResponse), { 
                                // `Response.headers` cannot be instantiated with the `Headers` polyfill.
                                // Apparently, it halts if the `Headers` class contains unknown properties
                                // (i.e. the internal `Headers.map`).
                                headers: headers_utils_1.flattenHeadersObject(response.headers || {}) }))];
                    }
                    debug('no mocked response found, bypassing...');
                    return [2 /*return*/, pureFetch(input, init).then(function (response) { return __awaiter(void 0, void 0, void 0, function () {
                            var cloneResponse, _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        cloneResponse = response.clone();
                                        debug('original fetch performed', cloneResponse);
                                        _b = (_a = observer).emit;
                                        _c = ['response',
                                            isoRequest];
                                        return [4 /*yield*/, normalizeFetchResponse(cloneResponse)];
                                    case 1:
                                        _b.apply(_a, _c.concat([_d.sent()]));
                                        return [2 /*return*/, response];
                                }
                            });
                        }); })];
            }
        });
    }); };
    return function () {
        debug('restoring modules...');
        window.fetch = pureFetch;
    };
};
exports.interceptFetch = interceptFetch;
function normalizeFetchResponse(response) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = {
                        status: response.status,
                        statusText: response.statusText,
                        headers: headers_utils_1.objectToHeaders(headers_utils_1.headersToObject(response.headers))
                    };
                    return [4 /*yield*/, response.text()];
                case 1: return [2 /*return*/, (_a.body = _b.sent(),
                        _a)];
            }
        });
    });
}
//# sourceMappingURL=index.js.map