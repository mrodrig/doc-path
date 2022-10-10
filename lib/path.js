/**
 * @license MIT
 * doc-path <https://github.com/mrodrig/doc-path>
 * Copyright (c) 2015-present, Michael Rodrigues.
 */
'use strict';

module.exports = {
    evaluatePath,
    setPath
};

/**
 * Main function that evaluates the path in a particular object
 * @param {Object|Array} obj object to evaluate path in
 * @param {String} kp key path
 * @returns {*|null} value at key path
 * @throws {Error} possible error if call stack size is exceeded
 */
function evaluatePath(obj, kp) {
    if (!obj) {
        return null;
    }

    let {dotIndex, key, remaining} = state(kp);

    // If there is a '.' in the key path and the key path doesn't appear in the object, recur on the subobject
    if (dotIndex >= 0 && !obj[kp]) {
        // If there's an array at the current key in the object, then iterate over those items evaluating the remaining path
        if (Array.isArray(obj[key])) {
            return obj[key].map((doc) => evaluatePath(doc, remaining));
        }
        // Otherwise, we can just recur
        return evaluatePath(obj[key], remaining);
    } else if (Array.isArray(obj)) {
        // If this object is actually an array, then iterate over those items evaluating the path
        return obj.map((doc) => evaluatePath(doc, kp));
    } else if (dotIndex >= 0 && kp !== key && obj[key]) {
        // If there's a field with a non-nested dot, then recur into that sub-value
        return evaluatePath(obj[key], remaining);
    } else if (dotIndex === -1 && obj[key] && !obj[kp]) {
        // If the field is here, but the key was escaped
        return obj[key];
    }

    // Otherwise, we can just return value directly
    return obj[kp];
}

/**
 * Main function that performs validation before passing off to _sp
 * @param obj {Object|Array} object to set value in
 * @param kp {String} key path
 * @param v {*} value to be set
 * @returns {Object|Array}
 * @throws {Error} possible error if call stack size is exceeded
 */
function setPath(obj, kp, v) {
    if (!obj) {
        throw new Error('No object was provided.');
    } else if (!kp) {
        throw new Error('No keyPath was provided.');
    }

    return _sp(obj, kp, v);
}

/**
 * Helper function that will set the value in the provided object/array.
 * @param obj {Object|Array} object to set value in
 * @param kp {String} key path
 * @param v {*} value to be set
 * @returns {Object|Array}
 * @private
 */
function _sp(obj, kp, v) {
    let {dotIndex, key, remaining} = state(kp);

    // If this is clearly a prototype pollution attempt, then refuse to modify the path
    if (kp.startsWith('__proto__') || kp.startsWith('constructor') || kp.startsWith('prototype')) {
        return obj;
    }

    if (dotIndex >= 0) {
        // If there is a '.' in the key path, recur on the subdoc and ...
        if (!obj[key] && Array.isArray(obj)) {
            // If this is an array and there are multiple levels of keys to iterate over, recur.
            return obj.forEach((doc) => _sp(doc, kp, v));
        } else if (!obj[key]) {
            // If the current key doesn't exist yet, populate it
            obj[key] = {};
        }
        _sp(obj[key], remaining, v);
    } else if (Array.isArray(obj)) {
        // If this "obj" is actually an array, then we can loop over each of the values and set the path
        return obj.forEach((doc) => _sp(doc, remaining, v));
    } else {
        // Otherwise, we can set the path directly
        obj[key] = v;
    }

    return obj;
}

/**
 * Helper function that returns some information necessary to evaluate or set a path
 *   based on the provided keyPath value
 * @param kp {String} key path (eg. 'specifications.mileage')
 * @returns {{dotIndex: Number, key: String, remaining: String}}
 */
function state(kp) {
    let dotIndex = findFirstNonEscapedDotIndex(kp);

    return {
        dotIndex,
        key: kp.slice(0, dotIndex >= 0 ? dotIndex : undefined).replace(/\\./g, '.'),
        remaining: kp.slice(dotIndex + 1)
    };
}

function findFirstNonEscapedDotIndex(kp) {
    for (let i = 0; i < kp.length; i++) {
        const previousChar = i > 0 ? kp[i - 1] : '',
            currentChar = kp[i];
        if (currentChar === '.' && previousChar !== '\\') return i;
    }
    return -1;
}
