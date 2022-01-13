"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientRequestOverride = void 0;
var util_1 = require("util");
var http_1 = __importDefault(require("http"));
var until_1 = require("@open-draft/until");
var headers_utils_1 = require("headers-utils");
var SocketPolyfill_1 = require("./polyfills/SocketPolyfill");
/* Utils */
var getUrlByRequestOptions_1 = require("../../utils/getUrlByRequestOptions");
var bodyBufferToString_1 = require("./utils/bodyBufferToString");
var concatChunkToBuffer_1 = require("./utils/concatChunkToBuffer");
var inheritRequestHeaders_1 = require("./utils/inheritRequestHeaders");
var normalizeHttpRequestParams_1 = require("./utils/normalizeHttpRequestParams");
var normalizeHttpRequestEndParams_1 = require("./utils/normalizeHttpRequestEndParams");
var getIncomingMessageBody_1 = require("./utils/getIncomingMessageBody");
var toIsoResponse_1 = require("../../utils/toIsoResponse");
var uuid_1 = require("../../utils/uuid");
var createDebug = require('debug');
function createClientRequestOverride(options) {
    var defaultProtocol = options.defaultProtocol, pureClientRequest = options.pureClientRequest, pureMethod = options.pureMethod, observer = options.observer, resolver = options.resolver;
    function ClientRequestOverride() {
        var _this = this;
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _b = __read(normalizeHttpRequestParams_1.normalizeHttpRequestParams.apply(void 0, __spreadArray([defaultProtocol], __read(args))), 3), url = _b[0], options = _b[1], callback = _b[2];
        var usesHttps = url.protocol === 'https:';
        var requestBodyBuffer = [];
        var debug = createDebug("http " + options.method + " " + url.href);
        // Inherit ClientRequest properties from RequestOptions.
        this.method = options.method || 'GET';
        this.path = options.path || getUrlByRequestOptions_1.DEFAULT_PATH;
        debug('intercepted %s %s (%s)', options.method, url.href, url.protocol);
        http_1.default.OutgoingMessage.call(this);
        // Propagate options headers to the request instance.
        inheritRequestHeaders_1.inheritRequestHeaders(this, options.headers);
        var socket = new SocketPolyfill_1.SocketPolyfill(options, {
            usesHttps: usesHttps,
        });
        this.socket = this.connection = socket;
        if (options.timeout) {
            debug('setting socket timeout to %a', options.timeout);
            socket.setTimeout(options.timeout);
        }
        // Create a mocked response instance.
        var response = new http_1.default.IncomingMessage(socket);
        if (((_a = options.headers) === null || _a === void 0 ? void 0 : _a.expect) === '100-continue') {
            debug('encountered "100 Continue" header');
            this.emit('continue');
        }
        process.nextTick(function () {
            _this.emit('socket', socket);
            socket.emit('connect');
            if (socket.authorized) {
                debug('emitting authorized socket event');
                socket.emit('secureConnect');
            }
        });
        if (callback) {
            this.once('response', callback);
        }
        var emitError = function (error) {
            process.nextTick(function () {
                _this.emit('error', error);
            });
        };
        this.write = function (chunk) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            debug('write', chunk, args);
            var callback = typeof args[1] === 'function' ? args[1] : args[2];
            if (_this.aborted) {
                debug('cannot write: request aborted');
                emitError(new Error('Request aborted'));
            }
            else {
                if (chunk) {
                    debug('request write: concat chunk to buffer', chunk);
                    requestBodyBuffer = concatChunkToBuffer_1.concatChunkToBuffer(chunk, requestBodyBuffer);
                }
                if (typeof callback === 'function') {
                    callback();
                }
            }
            setTimeout(function () {
                _this.emit('drain');
            }, 0);
            return false;
        };
        this.end = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var _a, chunk, encoding, callback, writtenRequestBody, resolvedRequestBody, outgoingHeaders, resolvedRequestHeaders, requesHeadersObject, requestHeaders, isoRequest, _b, resolverError, mockedResponse, _c, headers, request;
                var _this = this;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _a = __read(normalizeHttpRequestEndParams_1.normalizeHttpRequestEndParams.apply(void 0, __spreadArray([], __read(args))), 3), chunk = _a[0], encoding = _a[1], callback = _a[2];
                            debug('end', { chunk: chunk, encoding: encoding, callback: callback });
                            debug('request headers', options.headers);
                            writtenRequestBody = bodyBufferToString_1.bodyBufferToString(Buffer.concat(requestBodyBuffer));
                            debug('request written body', writtenRequestBody);
                            resolvedRequestBody = bodyBufferToString_1.bodyBufferToString(Buffer.concat(chunk
                                ? concatChunkToBuffer_1.concatChunkToBuffer(chunk, requestBodyBuffer)
                                : requestBodyBuffer));
                            debug('request resolved body', resolvedRequestBody);
                            outgoingHeaders = this.getHeaders();
                            resolvedRequestHeaders = Object.assign({}, outgoingHeaders, options.headers);
                            requesHeadersObject = Object.entries(resolvedRequestHeaders).reduce(function (headersObject, _a) {
                                var _b = __read(_a, 2), name = _b[0], value = _b[1];
                                if (value) {
                                    var corcedValue = typeof value === 'number' ? value.toString() : value;
                                    headersObject[name.toLowerCase()] = corcedValue;
                                }
                                return headersObject;
                            }, {});
                            debug('request headers object', requesHeadersObject);
                            requestHeaders = new headers_utils_1.Headers(requesHeadersObject);
                            debug('request headers', requestHeaders);
                            isoRequest = {
                                id: uuid_1.uuidv4(),
                                url: url,
                                method: options.method || 'GET',
                                headers: requestHeaders,
                                body: resolvedRequestBody,
                            };
                            observer.emit('request', isoRequest);
                            debug('awaiting mocked response...');
                            return [4 /*yield*/, until_1.until(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, resolver(isoRequest, response)];
                                }); }); })
                                // When the request middleware throws an exception, error the request.
                                // This cancels the request and is similar to a network error.
                            ];
                        case 1:
                            _b = __read.apply(void 0, [_d.sent()
                                // When the request middleware throws an exception, error the request.
                                // This cancels the request and is similar to a network error.
                                , 2]), resolverError = _b[0], mockedResponse = _b[1];
                            // When the request middleware throws an exception, error the request.
                            // This cancels the request and is similar to a network error.
                            if (resolverError) {
                                debug('middleware function threw an exception!', resolverError);
                                this.emit('error', resolverError);
                                return [2 /*return*/, this];
                            }
                            if (mockedResponse) {
                                debug('received mocked response:', mockedResponse);
                                // Prevent modifying an already finished response.
                                if (!response.complete) {
                                    _c = mockedResponse.headers, headers = _c === void 0 ? {} : _c;
                                    response.statusCode = mockedResponse.status;
                                    response.statusMessage = mockedResponse.statusText;
                                    debug('writing response headers...');
                                    // Converts mocked response headers to actual headers
                                    // (lowercases header names and merges duplicates).
                                    response.headers = Object.entries(headers).reduce(function (acc, _a) {
                                        var _b = __read(_a, 2), name = _b[0], value = _b[1];
                                        var headerName = name.toLowerCase();
                                        var headerValue = acc.hasOwnProperty(headerName)
                                            ? [].concat(acc[headerName], value)
                                            : value;
                                        acc[headerName] = headerValue;
                                        return acc;
                                    }, {});
                                    // Converts mocked response headers to raw headers.
                                    // @see https://nodejs.org/api/http.html#http_message_rawheaders
                                    response.rawHeaders = Object.entries(headers).reduce(function (acc, _a) {
                                        var _b = __read(_a, 2), name = _b[0], value = _b[1];
                                        return acc.concat(name, value);
                                    }, []);
                                    if (mockedResponse.body) {
                                        debug('writing response body...');
                                        response.push(Buffer.from(mockedResponse.body));
                                    }
                                }
                                debug('response is complete, finishing request...');
                                // Invoke the "req.end()" callback.
                                callback === null || callback === void 0 ? void 0 : callback();
                                this.finished = true;
                                this.emit('finish');
                                this.emit('response', response);
                                // Pushing `null` indicates that the response body is complete
                                // and must not be modified anymore.
                                response.push(null);
                                response.complete = true;
                                observer.emit('response', isoRequest, toIsoResponse_1.toIsoResponse(mockedResponse));
                                return [2 /*return*/, this];
                            }
                            debug('no mocked response received');
                            debug('performing original %s %s (%s)', options.method, url.href, url.protocol);
                            debug('original request options', options);
                            debug('original request body (written)', writtenRequestBody);
                            debug('original request body (end)', chunk);
                            debug('using', pureMethod);
                            // XMLHttpRequest can trigger "http.request" for https URL.
                            request = pureMethod(url.toString(), options);
                            // Propagate headers set after `ClientRequest` is constructed
                            // onto the original request instance.
                            inheritRequestHeaders_1.inheritRequestHeaders(request, outgoingHeaders);
                            // Propagate a request body buffer written via `req.write()`
                            // to the original request.
                            if (requestBodyBuffer.length > 0 && request.writable) {
                                request.write(Buffer.concat(requestBodyBuffer));
                            }
                            request.on('finish', function () {
                                _this.emit('finish');
                            });
                            request.on('response', function (response) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c;
                                var _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            _b = (_a = observer).emit;
                                            _c = ['response', isoRequest];
                                            _d = {
                                                status: response.statusCode || 200,
                                                statusText: response.statusMessage || 'OK',
                                                headers: headers_utils_1.objectToHeaders(response.headers)
                                            };
                                            return [4 /*yield*/, getIncomingMessageBody_1.getIncomingMessageBody(response)];
                                        case 1:
                                            _b.apply(_a, _c.concat([(_d.body = _e.sent(),
                                                    _d)]));
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            request.on('response', function (response) {
                                debug(response.statusCode, options.method, url.href);
                                _this.emit('response', response);
                            });
                            request.on('error', function (error) {
                                debug('original request error', error);
                                _this.emit('error', error);
                            });
                            // Provide a callback when an original request is finished,
                            // so it can be debugged.
                            request.end.apply(request, __spreadArray([], __read([
                                chunk,
                                encoding,
                                function () {
                                    debug('request ended', _this.method, url.href);
                                    callback === null || callback === void 0 ? void 0 : callback();
                                },
                            ].filter(Boolean))));
                            return [2 /*return*/, request];
                    }
                });
            });
        };
        this.abort = function () {
            debug('abort');
            if (_this.aborted) {
                debug('already aborted');
                return;
            }
            _this.aborted = true;
            var error = new Error();
            error.code = 'aborted';
            response.emit('close', error);
            socket.destroy();
            _this.emit('abort');
        };
        return this;
    }
    util_1.inherits(ClientRequestOverride, pureClientRequest);
    return ClientRequestOverride;
}
exports.createClientRequestOverride = createClientRequestOverride;
//# sourceMappingURL=createClientRequestOverride.js.map