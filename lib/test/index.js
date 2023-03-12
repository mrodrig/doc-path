'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const path_1 = require("../path");
const assert_1 = __importDefault(require("assert"));
let doc = {};
describe('doc-path Module', function () {
    describe('evaluatePath', function () {
        beforeEach(function () {
            doc = {};
        });
        it('should get a non-nested property that exists', function (done) {
            doc.testProperty = 'testValue';
            const returnVal = (0, path_1.evaluatePath)(doc, 'testProperty');
            assert_1.default.equal(returnVal, 'testValue');
            done();
        });
        it('should return null if the non-nested property does not exist', function (done) {
            const returnVal = (0, path_1.evaluatePath)(doc, 'testProperty');
            assert_1.default.equal(returnVal, null);
            done();
        });
        it('should get a non-nested property that exists', function (done) {
            doc.testProperty = {
                testProperty2: 'testValue'
            };
            const returnVal = (0, path_1.evaluatePath)(doc, 'testProperty.testProperty2');
            assert_1.default.equal(returnVal, 'testValue');
            done();
        });
        it('should return null if the nested property does not exist', function (done) {
            const returnVal = (0, path_1.evaluatePath)(doc, 'testProperty.testProperty2');
            assert_1.default.equal(returnVal, null);
            done();
        });
        it('should work with multiple accesses', (done) => {
            doc = {
                testProperty: {
                    testProperty2: 'testVal'
                },
                testProperty3: 'testVal2'
            };
            let returnVal = (0, path_1.evaluatePath)(doc, 'testProperty.testProperty2');
            assert_1.default.equal(returnVal, 'testVal');
            returnVal = (0, path_1.evaluatePath)(doc, 'testProperty3');
            assert_1.default.equal(returnVal, 'testVal2');
            done();
        });
        it('should work with equal key value', (done) => {
            doc = {
                testProperty: {
                    testProperty2: 'testVal'
                },
                'testProperty.testProperty2': 'testVal2'
            };
            const returnVal = (0, path_1.evaluatePath)(doc, 'testProperty\\.testProperty2');
            assert_1.default.equal(returnVal, 'testVal2');
            done();
        });
        it('should work with a nested array of objects', (done) => {
            doc = {
                features: [
                    { feature: 'A/C' },
                    { feature: 'Radio' }
                ]
            };
            const returnVal = (0, path_1.evaluatePath)(doc, 'features.feature');
            assert_1.default.deepEqual(returnVal, ['A/C', 'Radio']);
            done();
        });
        it('should work with multiple levels of nested arrays containing objects', (done) => {
            doc = {
                features: [
                    {
                        packages: [
                            { name: 'Base' },
                            { name: 'Premium' }
                        ]
                    },
                    {
                        packages: [
                            { name: 'Convenience' },
                            { name: 'Premium' },
                            5
                        ]
                    }
                ]
            };
            const returnVal = (0, path_1.evaluatePath)(doc, 'features.packages.name');
            assert_1.default.deepEqual(returnVal, [['Base', 'Premium'], ['Convenience', 'Premium', undefined]]);
            done();
        });
        it('should work with an array of objects', (done) => {
            doc = [
                { feature: 'A/C' },
                { feature: 'Radio' }
            ];
            const returnVal = (0, path_1.evaluatePath)(doc, 'feature');
            assert_1.default.deepEqual(returnVal, ['A/C', 'Radio']);
            done();
        });
        it('should work with nested dots in the path when escaped properly', (done) => {
            doc = {
                'a.a': 'a',
                'a.b': {
                    'c.d': '4',
                    c: '5',
                    'c.f': '6'
                },
                a: {
                    a: 1,
                    b: 2,
                    'b.c.d': 32
                }
            };
            // Normal paths:
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'a.a'), 1);
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'a.b'), 2);
            // Nested dot paths:
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'a\\.a'), 'a');
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'a\\.b.c\\.d'), '4');
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'a\\.b.c'), '5');
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'a\\.b.c\\.f'), '6');
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'a.b\\.c\\.d'), 32);
            done();
        });
        it('should evaluate falsy values correctly', (done) => {
            doc = {
                'A.B': false,
                'B.C': true,
                'C.D': 1,
                'D.E': 0,
                'E.F': 'abc'
            };
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'A.B'), false);
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'B.C'), true);
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'C.D'), 1);
            assert_1.default.equal((0, path_1.evaluatePath)(doc, 'D.E'), 0);
            done();
        });
    });
    describe('setPath', () => {
        beforeEach(() => {
            doc = {};
        });
        it('should get a non-nested property that exists', function (done) {
            const returnVal = (0, path_1.setPath)(doc, 'testProperty', 'null');
            assert_1.default.equal(returnVal, doc);
            done();
        });
        it('should throw an error if no object was provided', function (done) {
            try {
                const doc = null;
                assert_1.default.equal(doc, null);
                (0, path_1.setPath)(doc, 'testProperty', 'null');
            }
            catch (err) {
                if (err instanceof Error) {
                    assert_1.default.equal(err.message, 'No object was provided.');
                    return done();
                }
                done(err);
            }
        });
        it('should get a non-nested property that exists', function (done) {
            const returnVal = (0, path_1.setPath)(doc, 'testProperty.testProperty2', 'testValue');
            assert_1.default.equal(returnVal, doc);
            done();
        });
        it('should throw an error if no object was provided with recursive key', function (done) {
            try {
                const doc = null;
                assert_1.default.equal(doc, null);
                (0, path_1.setPath)(doc, 'testProperty.test', 'null');
            }
            catch (err) {
                if (err instanceof Error) {
                    assert_1.default.equal(err.message, 'No object was provided.');
                    return done();
                }
                done(err);
            }
        });
        // it('should throw an error if no key path was provided', function(done) {
        //     try {
        //         doc = {};
        //         const kp = null;
        //         assert.equal(kp, null);
        //         setPath(doc, kp, 'null');
        //     } catch (err) {
        //         if (err instanceof Error) {
        //             assert.equal(err.message, 'No keyPath was provided.');
        //             return done();
        //         }
        //         done(err);
        //     }
        // });
        it('should work with multiple accesses', (done) => {
            let returnVal = (0, path_1.setPath)(doc, 'testProperty.testProperty2', 'testVal');
            assert_1.default.equal(returnVal, doc);
            returnVal = (0, path_1.setPath)(doc, 'testProperty.testProperty2', 'testVal2');
            assert_1.default.equal(returnVal, doc);
            done();
        });
        it('should work an array of objects', (done) => {
            doc = {
                features: [
                    { feature: 'A/C' },
                    { feature: 'Radio' }
                ]
            };
            const returnVal = (0, path_1.setPath)(doc, 'features.feature', 'None');
            assert_1.default.deepEqual(returnVal, {
                features: [
                    { feature: 'None' },
                    { feature: 'None' }
                ]
            });
            done();
        });
        it('should work an array of objects', (done) => {
            doc = {
                features: [
                    {
                        packages: [
                            { name: 'Base' },
                            { name: 'Premium' }
                        ]
                    },
                    {
                        packages: [
                            { name: 'Convenience' },
                            { name: 'Premium' }
                        ]
                    }
                ]
            };
            const returnVal = (0, path_1.setPath)(doc, 'features.packages.name', 'None');
            assert_1.default.deepEqual(returnVal, {
                features: [
                    {
                        packages: [
                            { name: 'None' },
                            { name: 'None' }
                        ]
                    },
                    {
                        packages: [
                            { name: 'None' },
                            { name: 'None' }
                        ]
                    }
                ]
            });
            done();
        });
        it('should protect against prototype pollution via __proto__', (done) => {
            doc = {};
            assert_1.default.equal(doc.polluted, undefined);
            (0, path_1.setPath)(doc, '__proto__.polluted', 'prototype-polluted');
            assert_1.default.equal(doc.__proto__.polluted, undefined);
            assert_1.default.equal(doc.polluted, undefined);
            assert_1.default.equal({}.polluted, undefined);
            assert_1.default.equal(Object.polluted, undefined);
            done();
        });
        it('should protect against prototype pollution via constructor', (done) => {
            doc = {};
            (0, path_1.setPath)(doc, 'constructor', 'prototype-polluted');
            assert_1.default.equal(doc.constructor, Object);
            (0, path_1.setPath)(doc, 'constructor.prototype.test', 'prototype-polluted');
            assert_1.default.equal(doc.test, undefined);
            assert_1.default.equal(doc.__proto__.test, undefined);
            done();
        });
        it('should protect against prototype pollution via prototype', (done) => {
            (0, path_1.setPath)(Object, 'prototype.test', 'prototype-polluted');
            assert_1.default.equal({}.__proto__.test, undefined);
            assert_1.default.equal(Object.prototype.test, undefined);
            (0, path_1.setPath)(Object, 'prototype', 'prototype-polluted');
            assert_1.default.notEqual({}.__proto__, 'prototype-polluted');
            assert_1.default.notEqual(Object.prototype, 'prototype-polluted');
            done();
        });
        it('should protect against prototype pollution even if leading dot', (done) => {
            (0, path_1.setPath)(Object, '.prototype.test', 'prototype-polluted');
            assert_1.default.equal({}.__proto__.test, undefined);
            assert_1.default.equal({}.test, undefined);
            done();
        });
        it('should protect against prototype pollution against a nested document', (done) => {
            doc = {};
            assert_1.default.equal(doc.polluted, undefined);
            (0, path_1.setPath)(doc, 'a.__proto__.polluted', 'polluted!');
            assert_1.default.equal(typeof doc.a, 'object');
            assert_1.default.equal(doc.polluted, undefined);
            assert_1.default.equal({}.polluted, undefined);
            assert_1.default.equal(Object.polluted, undefined);
            done();
        });
        it('should be able to set paths with nested dots correctly', (done) => {
            doc = {
                'a.a': 'a',
                'a.b': {
                    'c.d': '4',
                    c: '5',
                    'c.f': '6'
                },
                a: {
                    a: 1,
                    b: 2,
                    'b.c.d': 32
                }
            };
            // Normal paths:
            (0, path_1.setPath)(doc, 'a.a', 'b');
            assert_1.default.equal(doc.a.a, 'b');
            assert_1.default.notEqual(doc['a.a'], 'b');
            (0, path_1.setPath)(doc, 'a.b', 3);
            assert_1.default.equal(doc.a.b, 3);
            assert_1.default.notEqual(doc['a.b'], 3);
            // Nested dot paths:
            (0, path_1.setPath)(doc, 'a\\.a', 1);
            assert_1.default.equal(doc['a.a'], 1);
            assert_1.default.notEqual(doc.a.a, 1);
            (0, path_1.setPath)(doc, 'a\\.b.c\\.d', 4);
            assert_1.default.equal(doc['a.b']['c.d'], 4);
            (0, path_1.setPath)(doc, 'a\\.b.c', 5);
            assert_1.default.equal(doc['a.b'].c, 5);
            (0, path_1.setPath)(doc, 'a\\.b.c\\.f', 6);
            assert_1.default.equal(doc['a.b']['c.f'], 6);
            (0, path_1.setPath)(doc, 'a.b\\.c\\.d', 32);
            assert_1.default.equal(doc.a['b.c.d'], 32);
            done();
        });
        it('should handle multiple nested levels properly', (done) => {
            (0, path_1.setPath)(doc, 'data.category', 'Computers');
            (0, path_1.setPath)(doc, 'data.options.name', 'MacBook Pro 15');
            assert_1.default.equal(doc.data.category, 'Computers');
            assert_1.default.equal(doc.data.options.name, 'MacBook Pro 15');
            done();
        });
    });
});
//# sourceMappingURL=index.js.map