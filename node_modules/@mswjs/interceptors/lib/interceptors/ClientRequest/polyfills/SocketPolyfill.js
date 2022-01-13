"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketPolyfill = void 0;
var events_1 = require("events");
var SocketPolyfill = /** @class */ (function (_super) {
    __extends(SocketPolyfill, _super);
    function SocketPolyfill(options, socketOptions) {
        var _this = _super.call(this) || this;
        if (socketOptions.usesHttps) {
            _this.authorized = true;
        }
        _this.bufferSize = 0;
        _this.writableLength = 0;
        _this.writable = true;
        _this.readable = true;
        _this.pending = false;
        _this.destroyed = false;
        _this.connecting = false;
        _this.totalDelayMs = 0;
        _this.timeoutMs = null;
        var ipv6 = options.family === 6;
        _this.remoteFamily = ipv6 ? 'IPv6' : 'IPv4';
        _this.localAddress = _this.remoteAddress = ipv6 ? '::1' : '127.0.0.1';
        _this.localPort = _this.remotePort = _this.resolvePort(options.port);
        return _this;
    }
    SocketPolyfill.prototype.resolvePort = function (port) {
        if (port == null) {
            return 0;
        }
        if (typeof port === 'number') {
            return port;
        }
        return parseInt(port);
    };
    SocketPolyfill.prototype.address = function () {
        return {
            port: this.remotePort,
            family: this.remoteFamily,
            address: this.remoteAddress,
        };
    };
    SocketPolyfill.prototype.applyDelay = function (duration) {
        this.totalDelayMs += duration;
        if (this.timeoutMs && this.totalDelayMs > this.timeoutMs) {
            this.emit('timeout');
        }
    };
    /**
     * Enable/disable the use of Nagle's algorithm.
     * Nagle's algorithm delays data before it is sent via the network.
     */
    SocketPolyfill.prototype.setNoDelay = function (noDelay) {
        if (noDelay === void 0) { noDelay = true; }
        if (noDelay) {
            this.totalDelayMs = 0;
        }
        return this;
    };
    /**
     * Enable/disable keep-alive functionality, and optionally set the initial delay before
     * the first keepalive probe is sent on an idle socket.
     */
    SocketPolyfill.prototype.setKeepAlive = function () {
        return this;
    };
    SocketPolyfill.prototype.setTimeout = function (timeout, callback) {
        var _this = this;
        var timer = setTimeout(function () {
            callback === null || callback === void 0 ? void 0 : callback();
            _this.emit('timeout');
        }, timeout);
        // Unref the timer in Node.js so the process won't hang on exit if long
        // timeouts were used.
        if (typeof timer.unref === 'function') {
            timer.unref();
        }
        return this;
    };
    SocketPolyfill.prototype.getPeerCertificate = function () {
        return Buffer.from((Math.random() * 10000 + Date.now()).toString()).toString('base64');
    };
    // Mock methods required to write to the response body.
    SocketPolyfill.prototype.pause = function () {
        return this;
    };
    SocketPolyfill.prototype.resume = function () {
        return this;
    };
    SocketPolyfill.prototype.cork = function () { };
    SocketPolyfill.prototype.uncork = function () { };
    SocketPolyfill.prototype.destroy = function (error) {
        this.destroyed = true;
        this.readable = this.writable = false;
        if (error) {
            this.emit('error', error);
        }
        return this;
    };
    return SocketPolyfill;
}(events_1.EventEmitter));
exports.SocketPolyfill = SocketPolyfill;
//# sourceMappingURL=SocketPolyfill.js.map