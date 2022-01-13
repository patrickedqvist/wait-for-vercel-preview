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
Object.defineProperty(exports, "__esModule", { value: true });
exports.inheritRequestHeaders = void 0;
function inheritRequestHeaders(req, headers) {
    // Cannot write request headers once already written,
    // or when no headers are given.
    if (req.headersSent || !headers) {
        return;
    }
    Object.entries(headers).forEach(function (_a) {
        var _b = __read(_a, 2), name = _b[0], value = _b[1];
        if (value != null) {
            req.setHeader(name, value);
        }
    });
}
exports.inheritRequestHeaders = inheritRequestHeaders;
//# sourceMappingURL=inheritRequestHeaders.js.map