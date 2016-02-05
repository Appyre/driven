"use strict";
const debug = require('debug')('driven/utils');

module.exports = function set(context, path, value) {
    if (!context) {
        throw new Error(`Cannot call get() with '${path}' on an undefined context`);
    }
    if (!path) {
        throw new Error(`Cannot call get() with an undefined path`);
    }

    const parts = path.split('.');
    const key = path.pop();
    let finalContext = context;
    parts.forEach((subPath) => {
        if (!context[key]) {
            context[key] = {};
            debug.warn(`Property '${subPath}' in ${path} was silently initialized to {}`);
        }
        finalContext = context[key];
    });
    if (!finalContext.hasOwnProperty(key)) {
        debug.warn(`Property '${key}' in ${path} was silently added to the context`);
    }

    finalContext[key] = value;
    return value;
};