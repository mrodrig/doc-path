/**
 * @license MIT
 * doc-path <https://github.com/mrodrig/doc-path>
 * Copyright (c) 2015-present, Michael Rodrigues.
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPath = exports.evaluatePath = void 0;
/**
 * Main function that evaluates the path in a particular object
 * @throws {Error} possible error if call stack size is exceeded
 */
function evaluatePath(obj, kp) {
    if (!obj) {
        return null;
    }
    const { dotIndex, key, remaining } = state(kp);
    const kpVal = typeof obj === 'object' && kp in obj ? obj[kp] : undefined;
    const keyVal = typeof obj === 'object' && key in obj ? obj[key] : undefined;
    // If there is a '.' in the key path and the key path doesn't appear in the object, recur on the subobject
    if (dotIndex >= 0 && typeof obj === 'object' && !(kp in obj)) {
        // If there's an array at the current key in the object, then iterate over those items evaluating the remaining path
        if (Array.isArray(keyVal)) {
            return keyVal.map((doc) => evaluatePath(doc, remaining));
        }
        // Otherwise, we can just recur
        return evaluatePath(keyVal, remaining);
    }
    else if (Array.isArray(obj)) {
        // If this object is actually an array, then iterate over those items evaluating the path
        return obj.map((doc) => evaluatePath(doc, kp));
    }
    else if (dotIndex >= 0 && kp !== key && typeof obj === 'object' && key in obj) {
        // If there's a field with a non-nested dot, then recur into that sub-value
        return evaluatePath(keyVal, remaining);
    }
    else if (dotIndex === -1 && typeof obj === 'object' && key in obj && !(kp in obj)) {
        // If the field is here, but the key was escaped
        return keyVal;
    }
    // Otherwise, we can just return value directly
    return kpVal;
}
exports.evaluatePath = evaluatePath;
/**
 * Main function that performs validation before passing off to _sp
 * @throws {Error} possible error if call stack size is exceeded
 */
function setPath(obj, kp, v) {
    if (!obj) {
        throw new Error('No object was provided.');
    }
    else if (!kp) {
        throw new Error('No keyPath was provided.');
    }
    return _sp(obj, kp, v);
}
exports.setPath = setPath;
// Helper function that will set the value in the provided object/array.
function _sp(obj, kp, v) {
    const { dotIndex, key, remaining } = state(kp);
    // If this is clearly a prototype pollution attempt, then refuse to modify the path
    if (kp.startsWith('__proto__') || kp.startsWith('constructor') || kp.startsWith('prototype')) {
        return obj;
    }
    if (dotIndex >= 0) {
        // If there is a '.' in the key path, recur on the subdoc and ...
        if (typeof obj === 'object' && obj !== null && !(key in obj) && Array.isArray(obj)) {
            // If this is an array and there are multiple levels of keys to iterate over, recur.
            obj.forEach((doc) => _sp(doc, kp, v));
            return obj;
        }
        else if (typeof obj === 'object' && obj !== null && !(key in obj) && !Array.isArray(obj)) {
            // If the current key doesn't exist yet, populate it
            obj[key] = {};
        }
        _sp(obj[key], remaining, v);
    }
    else if (Array.isArray(obj)) {
        // If this "obj" is actually an array, then we can loop over each of the values and set the path
        obj.forEach((doc) => _sp(doc, remaining, v));
        return obj;
    }
    else {
        // Otherwise, we can set the path directly
        obj[key] = v;
    }
    return obj;
}
// Helper function that returns some information necessary to evaluate or set a path  based on the provided keyPath value
function state(kp) {
    const dotIndex = findFirstNonEscapedDotIndex(kp);
    return {
        dotIndex,
        key: kp.slice(0, dotIndex >= 0 ? dotIndex : undefined).replace(/\\./g, '.'),
        remaining: kp.slice(dotIndex + 1)
    };
}
function findFirstNonEscapedDotIndex(kp) {
    for (let i = 0; i < kp.length; i++) {
        const previousChar = i > 0 ? kp[i - 1] : '', currentChar = kp[i];
        if (currentChar === '.' && previousChar !== '\\')
            return i;
    }
    return -1;
}
//# sourceMappingURL=path.js.map