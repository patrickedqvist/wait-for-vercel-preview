"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XMLHttpRequest_1 = require("../interceptors/XMLHttpRequest");
var fetch_1 = require("../interceptors/fetch");
/**
 * The default preset provisions the interception of requests
 * regardless of their type (fetch/XMLHttpRequest).
 */
exports.default = [XMLHttpRequest_1.interceptXMLHttpRequest, fetch_1.interceptFetch];
//# sourceMappingURL=browser.js.map