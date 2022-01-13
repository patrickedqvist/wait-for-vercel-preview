/**
 * Sets a raw response body. Does not append any `Content-Type` headers.
 * @example
 * res(ctx.body('Successful response'))
 * res(ctx.body(JSON.stringify({ key: 'value' })))
 * @see {@link https://mswjs.io/docs/api/context/body `ctx.body()`}
 */
const body = (value) => {
    return (res) => {
        res.body = value;
        return res;
    };
};

/**
 * Sets a textual response body. Appends a `Content-Type: text/plain`
 * header on the mocked response.
 * @example res(ctx.text('Successful response'))
 * @see {@link https://mswjs.io/docs/api/context/text `ctx.text()`}
 */
const text = (body) => {
    return (res) => {
        res.headers.set('Content-Type', 'text/plain');
        res.body = body;
        return res;
    };
};

/**
 * Sets an XML response body. Appends a `Content-Type: text/xml` header
 * on the mocked response.
 * @example
 * res(ctx.xml('<node key="value">Content</node>'))
 * @see {@link https://mswjs.io/docs/api/context/xml `ctx.xml()`}
 */
const xml = (body) => {
    return (res) => {
        res.headers.set('Content-Type', 'text/xml');
        res.body = body;
        return res;
    };
};

export { body as b, text as t, xml as x };
