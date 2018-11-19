# A Document Path Library for Node

[![Dependencies](https://img.shields.io/david/mrodrig/doc-path.svg?style=flat-square)](https://www.npmjs.org/package/doc-path)
[![Build Status](https://travis-ci.org/mrodrig/doc-path.svg?branch=master)](https://travis-ci.org/mrodrig/doc-path)
[![Monthly Downloads](http://img.shields.io/npm/dm/doc-path.svg)](https://www.npmjs.org/package/doc-path)
[![NPM version](https://img.shields.io/npm/v/doc-path.svg)](https://www.npmjs.org/package/doc-path)
[![Maintainability](https://api.codeclimate.com/v1/badges/8d357f67aa5aaf8d727e/maintainability)](https://codeclimate.com/github/mrodrig/doc-path/maintainability)
[![Known Vulnerabilities](https://snyk.io/test/npm/doc-path/badge.svg)](https://snyk.io/test/npm/doc-path)

This module will take paths in documents which can include nested paths specified by '.'s and can evaluate the path
to a value, or can set the value at that path depending on the function called.

## Installation

```bash
$ npm install doc-path
```

## Usage

```javascript
let path = require('doc-path');
```

### API

#### path.evaluatePath(document, key)

* `document` - `Object` - A JSON document that will be iterated over.
* `key` - `String` - A path to the existing key whose value will be returned.

If the key does not exist, `undefined` is returned.

##### path.evaluatePath Example:

```javascript
const path = require('doc-path');

let document = {
    Make: 'Nissan',
    Model: 'Murano',
    Year: '2013',
    Specifications: {
        Mileage: '7106',
        Trim: 'S AWD'
    }
};

console.log(path.evaluatePath(document, 'Make'));
// => 'Nissan'

console.log(path.evaluatePath(document, 'Specifications.Mileage'));
// => '7106'
```

#### path.setPath(document, key, value)

* `document` - `Object` - A JSON document that will be iterated over.
* `key` - `String` - A path to the existing key whose value will be set.
* `value` - `*` - The value that will be set at the given key.

If the key does not exist, then the object will be built up to have that path.
If no document is provided, an error will be thrown.

#### path.setPath Example:

 ```javascript
 const path = require('doc-path');

 let document = {
     Make: 'Nissan'
 };

 console.log(path.setPath(document, 'Color.Interior', 'Tan'));
 // => { Make: 'Nissan', Color: { Interior: 'Tan' } }

 console.log(path.setPath(document, 'StockNumber', '34567'));
 // => { Make: 'Nissan', Color: { Interior: 'Tan' }, StockNumber: '34567' }
 ```

## Tests

```bash
$ npm test
```

_Note_: This requires `mocha`, `should`, `async`, and `underscore`.

To see test coverage, please run:
```bash
$ npm run coverage
```

Current Coverage is:
```
Statements   : 100% ( 21/21 )
Branches     : 100% ( 12/12 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 18/18 )
```

## Features

- Supports nested paths
- Same common path specification as other programs such as MongoDB