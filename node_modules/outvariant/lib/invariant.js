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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariant = exports.InvariantError = void 0;
var format_1 = require("./format");
var STACK_FRAMES_TO_IGNORE = 2;
var InvariantError = /** @class */ (function (_super) {
    __extends(InvariantError, _super);
    function InvariantError(message) {
        var positionals = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            positionals[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, message) || this;
        _this.name = 'Invariant Violation';
        _this.message = format_1.format.apply(void 0, __spreadArray([message], positionals));
        if (_this.stack) {
            var nextStack = _this.stack.split('\n');
            nextStack.splice(1, STACK_FRAMES_TO_IGNORE);
            _this.stack = nextStack.join('\n');
        }
        return _this;
    }
    return InvariantError;
}(Error));
exports.InvariantError = InvariantError;
function invariant(predicate, message) {
    var positionals = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        positionals[_i - 2] = arguments[_i];
    }
    if (!predicate) {
        throw new (InvariantError.bind.apply(InvariantError, __spreadArray([void 0, message], positionals)))();
    }
}
exports.invariant = invariant;
