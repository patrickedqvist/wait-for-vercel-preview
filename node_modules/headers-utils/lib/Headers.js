"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var normalizeHeaderName_1 = require("./utils/normalizeHeaderName");
var normalizeHeaderValue_1 = require("./utils/normalizeHeaderValue");
var HeadersPolyfill = /** @class */ (function () {
    function HeadersPolyfill(init) {
        var _this = this;
        // Normalized header {"name":"a, b"} storage.
        this._headers = {};
        // Keeps the mapping between the raw header name
        // and the normalized header name to ease the lookup.
        this._names = new Map();
        /**
         * @note Cannot check if the `init` is an instance of the `Headers`
         * because that class is only defined in the browser.
         */
        if (['Headers', 'HeadersPolyfill'].includes(init === null || init === void 0 ? void 0 : init.constructor.name) ||
            init instanceof HeadersPolyfill) {
            var initialHeaders = init;
            initialHeaders.forEach(function (value, name) {
                _this.append(name, value);
            }, this);
        }
        else if (Array.isArray(init)) {
            init.forEach(function (_a) {
                var _b = __read(_a, 2), name = _b[0], value = _b[1];
                _this.append(name, Array.isArray(value) ? value.join(', ') : value);
            });
        }
        else if (init) {
            Object.getOwnPropertyNames(init).forEach(function (name) {
                var value = init[name];
                _this.append(name, Array.isArray(value) ? value.join(', ') : value);
            });
        }
    }
    HeadersPolyfill.prototype[Symbol.iterator] = function () {
        return this.entries();
    };
    HeadersPolyfill.prototype.keys = function () {
        var _a, _b, name_1, e_1_1;
        var e_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, 6, 7]);
                    _a = __values(Object.keys(this._headers)), _b = _a.next();
                    _d.label = 1;
                case 1:
                    if (!!_b.done) return [3 /*break*/, 4];
                    name_1 = _b.value;
                    return [4 /*yield*/, name_1];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _b = _a.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    };
    HeadersPolyfill.prototype.values = function () {
        var _a, _b, value, e_2_1;
        var e_2, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, 6, 7]);
                    _a = __values(Object.values(this._headers)), _b = _a.next();
                    _d.label = 1;
                case 1:
                    if (!!_b.done) return [3 /*break*/, 4];
                    value = _b.value;
                    return [4 /*yield*/, value];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _b = _a.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_2_1 = _d.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    };
    HeadersPolyfill.prototype.entries = function () {
        var _a, _b, name_2, e_3_1;
        var e_3, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, 6, 7]);
                    _a = __values(Object.keys(this._headers)), _b = _a.next();
                    _d.label = 1;
                case 1:
                    if (!!_b.done) return [3 /*break*/, 4];
                    name_2 = _b.value;
                    return [4 /*yield*/, [name_2, this.get(name_2)]];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _b = _a.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_3_1 = _d.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    };
    /**
     * Returns a `ByteString` sequence of all the values of a header with a given name.
     */
    HeadersPolyfill.prototype.get = function (name) {
        return this._headers[normalizeHeaderName_1.normalizeHeaderName(name)] || null;
    };
    /**
     * Sets a new value for an existing header inside a `Headers` object, or adds the header if it does not already exist.
     */
    HeadersPolyfill.prototype.set = function (name, value) {
        var normalizedName = normalizeHeaderName_1.normalizeHeaderName(name);
        this._headers[normalizedName] = normalizeHeaderValue_1.normalizeHeaderValue(value);
        this._names.set(normalizedName, name);
    };
    /**
     * Appends a new value onto an existing header inside a `Headers` object, or adds the header if it does not already exist.
     */
    HeadersPolyfill.prototype.append = function (name, value) {
        var resolvedValue = this.has(name) ? this.get(name) + ", " + value : value;
        this.set(name, resolvedValue);
    };
    /**
     * Deletes a header from the `Headers` object.
     */
    HeadersPolyfill.prototype.delete = function (name) {
        if (!this.has(name)) {
            return this;
        }
        var normalizedName = normalizeHeaderName_1.normalizeHeaderName(name);
        delete this._headers[normalizedName];
        this._names.delete(normalizedName);
        return this;
    };
    /**
     * Returns the object of all the normalized headers.
     */
    HeadersPolyfill.prototype.all = function () {
        return this._headers;
    };
    /**
     * Returns the object of all the raw headers.
     */
    HeadersPolyfill.prototype.raw = function () {
        var _this = this;
        return Object.entries(this._headers).reduce(function (headers, _a) {
            var _b = __read(_a, 2), name = _b[0], value = _b[1];
            headers[_this._names.get(name)] = value;
            return headers;
        }, {});
    };
    /**
     * Returns a boolean stating whether a `Headers` object contains a certain header.
     */
    HeadersPolyfill.prototype.has = function (name) {
        return this._headers.hasOwnProperty(normalizeHeaderName_1.normalizeHeaderName(name));
    };
    /**
     * Traverses the `Headers` object,
     * calling the given callback for each header.
     */
    HeadersPolyfill.prototype.forEach = function (callback, thisArg) {
        for (var name_3 in this._headers) {
            if (this._headers.hasOwnProperty(name_3)) {
                callback.call(thisArg, this._headers[name_3], name_3, this);
            }
        }
    };
    return HeadersPolyfill;
}());
exports.default = HeadersPolyfill;
