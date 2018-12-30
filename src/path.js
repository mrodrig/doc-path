'use strict';

module.exports = {
    evaluatePath,
    setPath
};

function evaluatePath(document, keyPath) {
    if (!document) {
        return null;
    }

    let indexOfDot = keyPath.indexOf('.');

    // If there is a '.' in the keyPath and keyPath doesn't present in the document, recur on the subdoc and ...
    if (indexOfDot >= 0 && !document[keyPath]) {
        let currentKey = keyPath.slice(0, indexOfDot),
            remainingKeyPath = keyPath.slice(indexOfDot + 1);

        return evaluatePath(document[currentKey], remainingKeyPath);
    }

    return document[keyPath];
}

function setPath(document, keyPath, value) {
    if (!document) {
        throw new Error('No document was provided.');
    }

    let indexOfDot = keyPath.indexOf('.');

    // If there is a '.' in the keyPath, recur on the subdoc and ...
    if (indexOfDot >= 0) {
        let currentKey = keyPath.slice(0, indexOfDot),
            remainingKeyPath = keyPath.slice(indexOfDot + 1);

        if (!document[currentKey]) {
            document[currentKey] = {};

        }
        setPath(document[currentKey], remainingKeyPath, value);
    } else {
        document[keyPath] = value;
    }

    return document;
}
