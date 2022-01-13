"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterceptor = void 0;
var strict_event_emitter_1 = require("strict-event-emitter");
function createInterceptor(options) {
    var observer = new strict_event_emitter_1.StrictEventEmitter();
    var cleanupFns = [];
    return {
        apply: function () {
            cleanupFns = options.modules.map(function (interceptor) {
                return interceptor(observer, options.resolver);
            });
        },
        on: function (event, listener) {
            observer.addListener(event, listener);
        },
        restore: function () {
            observer.removeAllListeners();
            if (cleanupFns.length === 0) {
                throw new Error("Failed to restore patched modules: no patches found. Did you forget to run \".apply()\"?");
            }
            cleanupFns.forEach(function (restore) { return restore(); });
        },
    };
}
exports.createInterceptor = createInterceptor;
//# sourceMappingURL=createInterceptor.js.map