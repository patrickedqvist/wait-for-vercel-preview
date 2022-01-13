"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncomingMessageBody = void 0;
var zlib = __importStar(require("zlib"));
function getIncomingMessageBody(res) {
    var responseBody = '';
    var stream = res;
    if (res.headers['content-encoding'] === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
    }
    return new Promise(function (resolve, reject) {
        stream.once('error', function (error) {
            stream.removeAllListeners();
            reject(error);
        });
        stream.on('data', function (chunk) { return (responseBody += chunk); });
        stream.once('end', function () {
            stream.removeAllListeners();
            resolve(responseBody);
        });
    });
}
exports.getIncomingMessageBody = getIncomingMessageBody;
//# sourceMappingURL=getIncomingMessageBody.js.map