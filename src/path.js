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
 */
function setPath(obj, kp, v) {
    if (!obj) {
        throw new Error('No object was provided.');
    } else if (!kp) {
        throw new Error('No keyPath was provided.');
    }

    // If this is clearly a prototype pollution attempt, then refuse to modify the path
    if (kp.startsWith('__proto__') || kp.startsWith('constructor') || kp.startsWith('prototype')) {
        return obj;
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
        obj[kp] = v;
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
    let dotIndex = kp.indexOf('.');

    return {
        dotIndex,
        key: kp.slice(0, dotIndex >= 0 ? dotIndex : undefined),
        remaining: kp.slice(dotIndex + 1)
    };
}
