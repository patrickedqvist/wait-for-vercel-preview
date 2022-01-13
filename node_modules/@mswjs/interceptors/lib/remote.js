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
exports.createRemoteResolver = exports.createRemoteInterceptor = void 0;
var headers_utils_1 = require("headers-utils");
var outvariant_1 = require("outvariant");
var strict_event_emitter_1 = require("strict-event-emitter");
var createInterceptor_1 = require("./createInterceptor");
var toIsoResponse_1 = require("./utils/toIsoResponse");
function requestReviver(key, value) {
    switch (key) {
        case 'url':
            return new URL(value);
        case 'headers':
            return new headers_utils_1.Headers(value);
        default:
            return value;
    }
}
/**
 * Creates a remote request interceptor that delegates
 * the mocked response resolution to the parent process.
 * The parent process must establish a remote resolver
 * by calling `createRemoteResolver` function.
 */
function createRemoteInterceptor(options) {
    outvariant_1.invariant(process.connected, "Failed to create a remote interceptor: the current process (%s) does not have a parent. Please make sure you're spawning this process as a child process in order to use remote request interception.", process.pid);
    if (typeof process.send === 'undefined') {
        throw new Error("Failed to create a remote interceptor: the current process (" + process.pid + ") does not have the IPC enabled. Please make sure you're spawning this process with the \"ipc\" stdio value set:\n\nspawn('node', ['module.js'], { stdio: ['ipc'] })");
    }
    var handleParentMessage;
    var interceptor = createInterceptor_1.createInterceptor(__assign(__assign({}, options), { resolver: function (request) {
            var _a;
            var serializedRequest = JSON.stringify(request);
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, "request:" + serializedRequest);
            return new Promise(function (resolve) {
                handleParentMessage = function (message) {
                    if (typeof message !== 'string') {
                        return;
                    }
                    if (message.startsWith("response:" + request.id)) {
                        var _a = __read(message.match(/^response:.+?:(.+)$/) || [], 2), responseString = _a[1];
                        if (!responseString) {
                            return resolve();
                        }
                        var mockedResponse = JSON.parse(responseString);
                        return resolve(mockedResponse);
                    }
                };
                process.addListener('message', handleParentMessage);
            });
        } }));
    return __assign(__assign({}, interceptor), { restore: function () {
            interceptor.restore();
            process.removeListener('message', handleParentMessage);
        } });
}
exports.createRemoteInterceptor = createRemoteInterceptor;
/**
 * Creates a response resolver function attached to the given `ChildProcess`.
 * The child process must establish a remote interceptor by calling `createRemoteInterceptor` function.
 */
function createRemoteResolver(options) {
    var _this = this;
    var observer = new strict_event_emitter_1.StrictEventEmitter();
    var handleChildMessage = function (message) { return __awaiter(_this, void 0, void 0, function () {
        var _a, requestString, isoRequest_1, mockedResponse_1, serializedResponse;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (typeof message !== 'string') {
                        return [2 /*return*/];
                    }
                    if (!message.startsWith('request:')) return [3 /*break*/, 2];
                    _a = __read(message.match(/^request:(.+)$/) || [], 2), requestString = _a[1];
                    if (!requestString) {
                        return [2 /*return*/];
                    }
                    isoRequest_1 = JSON.parse(requestString, requestReviver);
                    observer.emit('request', isoRequest_1);
                    return [4 /*yield*/, options.resolver(isoRequest_1, undefined)
                        // Send the mocked response to the child process.
                    ];
                case 1:
                    mockedResponse_1 = _b.sent();
                    serializedResponse = JSON.stringify(mockedResponse_1);
                    options.process.send("response:" + isoRequest_1.id + ":" + serializedResponse, function (error) {
                        if (error) {
                            return;
                        }
                        if (mockedResponse_1) {
                            // Emit an optimisting "response" event at this point,
                            // not to rely on the back-and-forth signaling for the sake of the event.
                            observer.emit('response', isoRequest_1, toIsoResponse_1.toIsoResponse(mockedResponse_1));
                        }
                    });
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var cleanup = function () {
        options.process.removeListener('message', handleChildMessage);
    };
    options.process.addListener('message', handleChildMessage);
    options.process.addListener('disconnect', cleanup);
    options.process.addListener('error', cleanup);
    options.process.addListener('exit', cleanup);
    return {
        on: function (event, listener) {
            observer.addListener(event, listener);
        },
    };
}
exports.createRemoteResolver = createRemoteResolver;
//# sourceMappingURL=remote.js.map