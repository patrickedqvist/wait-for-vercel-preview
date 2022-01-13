"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClientRequest_1 = require("../interceptors/ClientRequest");
var XMLHttpRequest_1 = require("../interceptors/XMLHttpRequest");
/**
 * The default preset provisions the interception of requests
 * regardless of their type (http/https/XMLHttpRequest).
 */
exports.default = [ClientRequest_1.interceptClientRequest, XMLHttpRequest_1.interceptXMLHttpRequest];
//# sourceMappingURL=node.js.map