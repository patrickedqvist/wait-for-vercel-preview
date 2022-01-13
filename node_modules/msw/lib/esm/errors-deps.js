import { j as jsonParse, g as json } from './fetch-deps.js';

/**
 * Determines if the given value is an object.
 */
function isObject(value) {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deeply merges two given objects with the right one
 * having a priority during property assignment.
 */
function mergeRight(left, right) {
    return Object.entries(right).reduce((result, [key, rightValue]) => {
        const leftValue = result[key];
        if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
            result[key] = leftValue.concat(rightValue);
            return result;
        }
        if (isObject(leftValue) && isObject(rightValue)) {
            result[key] = mergeRight(leftValue, rightValue);
            return result;
        }
        result[key] = rightValue;
        return result;
    }, Object.assign({}, left));
}

/**
 * Sets a given payload as a GraphQL response body.
 * @example
 * res(ctx.data({ user: { firstName: 'John' }}))
 * @see {@link https://mswjs.io/docs/api/context/data `ctx.data()`}
 */
const data = (payload) => {
    return (res) => {
        const prevBody = jsonParse(res.body) || {};
        const nextBody = mergeRight(prevBody, { data: payload });
        return json(nextBody)(res);
    };
};

/**
 * Sets the GraphQL extensions on a given response.
 * @example
 * res(ctx.extensions({ tracing: { version: 1 }}))
 * @see {@link https://mswjs.io/docs/api/context/extensions `ctx.extensions()`}
 */
const extensions = (payload) => {
    return (res) => {
        const prevBody = jsonParse(res.body) || {};
        const nextBody = mergeRight(prevBody, { extensions: payload });
        return json(nextBody)(res);
    };
};

/**
 * Sets a given list of GraphQL errors on the mocked response.
 * @example res(ctx.errors([{ message: 'Unauthorized' }]))
 * @see {@link https://mswjs.io/docs/api/context/errors}
 */
const errors = (errorsList) => {
    return (res) => {
        if (errorsList == null) {
            return res;
        }
        const prevBody = jsonParse(res.body) || {};
        const nextBody = mergeRight(prevBody, { errors: errorsList });
        return json(nextBody)(res);
    };
};

export { errors as a, data as d, extensions as e, mergeRight as m };
