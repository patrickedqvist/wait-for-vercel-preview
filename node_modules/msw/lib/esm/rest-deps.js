import { R as RequestHandler, f as cleanUrl, h as getSearchParams, d as devUtils, m as matchRequestUrl, g as getPublicUrlFromRequest, i as prepareRequest, j as prepareResponse, k as getStatusCodeColor, l as getTimestamp } from './RequestHandler-deps.js';
import { b as set, s as status, d as cookie, g as json, e as delay, f as fetch } from './fetch-deps.js';
import { b as body, t as text, x as xml } from './xml-deps.js';

/**
 * Performs a case-insensitive comparison of two given strings.
 */
function isStringEqual(actual, expected) {
    return actual.toLowerCase() === expected.toLowerCase();
}

var RESTMethods;
(function (RESTMethods) {
    RESTMethods["HEAD"] = "HEAD";
    RESTMethods["GET"] = "GET";
    RESTMethods["POST"] = "POST";
    RESTMethods["PUT"] = "PUT";
    RESTMethods["PATCH"] = "PATCH";
    RESTMethods["OPTIONS"] = "OPTIONS";
    RESTMethods["DELETE"] = "DELETE";
})(RESTMethods || (RESTMethods = {}));
const restContext = {
    set,
    status,
    cookie,
    body,
    text,
    json,
    xml,
    delay,
    fetch,
};
/**
 * Request handler for REST API requests.
 * Provides request matching based on method and URL.
 */
class RestHandler extends RequestHandler {
    constructor(method, path, resolver) {
        super({
            info: {
                header: `${method} ${path}`,
                path,
                method,
            },
            ctx: restContext,
            resolver,
        });
        this.checkRedundantQueryParameters();
    }
    checkRedundantQueryParameters() {
        const { method, path } = this.info;
        if (path instanceof RegExp) {
            return;
        }
        const url = cleanUrl(path);
        // Bypass request handler URLs that have no redundant characters.
        if (url === path) {
            return;
        }
        const searchParams = getSearchParams(path);
        searchParams.forEach((_, paramName) => {
        });
        devUtils.warn(`Found a redundant usage of query parameters in the request handler URL for "${method} ${path}". Please match against a path instead and access query parameters in the response resolver function using "req.url.searchParams".`);
    }
    parse(request, resolutionContext) {
        return matchRequestUrl(request.url, this.info.path, resolutionContext === null || resolutionContext === void 0 ? void 0 : resolutionContext.baseUrl);
    }
    getPublicRequest(request, parsedResult) {
        return Object.assign(Object.assign({}, request), { params: parsedResult.params || {} });
    }
    predicate(request, parsedResult) {
        const matchesMethod = this.info.method instanceof RegExp
            ? this.info.method.test(request.method)
            : isStringEqual(this.info.method, request.method);
        return matchesMethod && parsedResult.matches;
    }
    log(request, response) {
        const publicUrl = getPublicUrlFromRequest(request);
        const loggedRequest = prepareRequest(request);
        const loggedResponse = prepareResponse(response);
        const statusColor = getStatusCodeColor(response.status);
        console.groupCollapsed(devUtils.formatMessage('%s %s %s (%c%s%c)'), getTimestamp(), request.method, publicUrl, `color:${statusColor}`, `${response.status} ${response.statusText}`, 'color:inherit');
        console.log('Request', loggedRequest);
        console.log('Handler:', {
            mask: this.info.path,
            resolver: this.resolver,
        });
        console.log('Response', loggedResponse);
        console.groupEnd();
    }
}

function createRestHandler(method) {
    return (path, resolver) => {
        return new RestHandler(method, path, resolver);
    };
}
const rest = {
    all: createRestHandler(/.+/),
    head: createRestHandler(RESTMethods.HEAD),
    get: createRestHandler(RESTMethods.GET),
    post: createRestHandler(RESTMethods.POST),
    put: createRestHandler(RESTMethods.PUT),
    delete: createRestHandler(RESTMethods.DELETE),
    patch: createRestHandler(RESTMethods.PATCH),
    options: createRestHandler(RESTMethods.OPTIONS),
};

export { RestHandler as R, RESTMethods as a, restContext as b, isStringEqual as i, rest as r };
