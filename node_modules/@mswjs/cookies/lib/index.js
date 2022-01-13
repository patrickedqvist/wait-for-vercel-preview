"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERSISTENCY_KEY = exports.store = void 0;
var CookieStore_1 = require("./CookieStore");
Object.defineProperty(exports, "store", { enumerable: true, get: function () { return __importDefault(CookieStore_1).default; } });
Object.defineProperty(exports, "PERSISTENCY_KEY", { enumerable: true, get: function () { return CookieStore_1.PERSISTENCY_KEY; } });
