/**
 * @license MIT
 * doc-path <https://github.com/mrodrig/doc-path>
 * Copyright (c) 2015-present, Michael Rodrigues.
 */
'use strict';

/**
 * Main function that evaluates the path in a particular object
 * @throws {Error} possible error if call stack size is exceeded
 */
export function evaluatePath(obj: unknown, kp: string): unknown {
    if (typeof obj !== 'object' || obj === null || !obj) {
        return null;
    }

    const {dotIndex, key, remaining} = state(kp);
    const kpVal = typeof obj === 'object' && kp in obj ? (obj as Record<string, unknown>)[kp] : null;
    const keyVal = key in obj ? (obj as Record<string, unknown>)[key] : null;

    // If there is a '.' in the key path and the key path doesn't appear in the object, recur on the subobject
    if (dotIndex >= 0 && typeof obj === 'object' && !(kp in obj)) {
        // If there's an array at the current key in the object, then iterate over those items evaluating the remaining path
        if (Array.isArray(keyVal)) {
            return keyVal.map((doc: unknown) => evaluatePath(doc, remaining));
        }
        // Otherwise, we can just recur
        return evaluatePath(keyVal, remaining);
    } else if (Array.isArray(obj)) {
        // If this object is actually an array, then iterate over those items evaluating the path
        return obj.map((doc) => evaluatePath(doc, kp));
    } else if (dotIndex >= 0 && kp !== key && typeof obj === 'object' && key in obj) {
    // If there's a field with a non-nested dot, then recur into that sub-value
        return evaluatePath(keyVal, remaining);
    } else if (dotIndex === -1 && typeof obj === 'object' && key in obj && !(kp in obj)) {
        // If the field is here, but the key was escaped
        return keyVal;
    }

    // Otherwise, we can just return value directly
    return kpVal;
}

/**
 * Main function that performs validation before passing off to _sp
 * @throws {Error} possible error if call stack size is exceeded
 */
export function setPath<T>(obj: T, kp: string, v: unknown): T {
    if (!obj) {
        throw new Error('No object was provided.');
    } else if (!kp) {
        throw new Error('No keyPath was provided.');
    }

    return _sp(obj, kp, v);
}

// Helper function that will set the value in the provided object/array.
function _sp<T>(obj: T, kp: string, v: unknown): T {
    const {dotIndex, key, remaining} = state(kp);

    // If this is clearly a prototype pollution attempt, then refuse to modify the path
    if (kp.startsWith('__proto__') || kp.startsWith('constructor') || kp.startsWith('prototype')) {
        return obj;
    }

    if (dotIndex >= 0) {
        // If there is a '.' in the key path, recur on the subdoc and ...
        if (typeof obj === 'object' && obj !== null && !(key in obj) && Array.isArray(obj)) {
            // If this is an array and there are multiple levels of keys to iterate over, recur.
            obj.forEach((doc) => _sp(doc, kp, v));
        } else if (typeof obj === 'object' && obj !== null && !(key in obj) && !Array.isArray(obj)) {
            // If the current key doesn't exist yet, populate it
            (obj as Record<string, unknown>)[key] = {};
        } else {
            _sp((obj as Record<string, unknown>)[key], remaining, v);
        }
    } else if (Array.isArray(obj)) {
        // If this "obj" is actually an array, then we can loop over each of the values and set the path
        obj.forEach((doc) => _sp(doc, remaining, v));
    } else {
        // Otherwise, we can set the path directly
        (obj as Record<string, unknown>)[key] = v;
    }

    return obj;
}

// Helper function that returns some information necessary to evaluate or set a path  based on the provided keyPath value
function state(kp: string): PathState {
    const dotIndex = findFirstNonEscapedDotIndex(kp);
    return {
        dotIndex,
        key: kp.slice(0, dotIndex >= 0 ? dotIndex : undefined).replace(/\\./g, '.'),
        remaining: kp.slice(dotIndex + 1)
    };
}

function findFirstNonEscapedDotIndex(kp: string) {
    for (let i = 0; i < kp.length; i++) {
        const previousChar = i > 0 ? kp[i - 1] : '',
            currentChar = kp[i];
        if (currentChar === '.' && previousChar !== '\\') return i;
    }
    return -1;
}

interface PathState {
    dotIndex: number;
    key: string;
    remaining: string;
}