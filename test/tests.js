'use strict';

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

let path = require('../lib/path'),
    should = require('should'),
    assert = require('assert'),
    doc = {};

describe('doc-path Module', function() {
    describe('evaluatePath', function() {
        beforeEach(function() {
            doc = {};
        });

        it('should get a non-nested property that exists', function(done) {
            doc.testProperty = 'testValue';
            let returnVal = path.evaluatePath(doc, 'testProperty');
            returnVal.should.equal('testValue');
            done();
        });

        it('should return null if the non-nested property does not exist', function(done) {
            let returnVal = path.evaluatePath(doc, 'testProperty');
            assert.equal(returnVal, null);
            done();
        });

        it('should get a non-nested property that exists', function(done) {
            doc.testProperty = {
                testProperty2: 'testValue'
            };
            let returnVal = path.evaluatePath(doc, 'testProperty.testProperty2');
            returnVal.should.equal('testValue');
            done();
        });

        it('should return null if the nested property does not exist', function(done) {
            let returnVal = path.evaluatePath(doc, 'testProperty.testProperty2');
            assert.equal(returnVal, null);
            done();
        });

        it('should work with multiple accesses', (done) => {
            doc = {
                testProperty: {
                    testProperty2: 'testVal'
                },
                testProperty3: 'testVal2'
            };
            let returnVal = path.evaluatePath(doc, 'testProperty.testProperty2');
            assert.equal(returnVal, 'testVal');
            returnVal = path.evaluatePath(doc, 'testProperty3');
            assert.equal(returnVal, 'testVal2');
            done();
        });

        it('should work with equal key value', (done) => {
            doc = {
                testProperty: {
                    testProperty2: 'testVal'
                },
                'testProperty.testProperty2': 'testVal2'
            };
            let returnVal = path.evaluatePath(doc, 'testProperty\\.testProperty2');
            assert.equal(returnVal, 'testVal2');
            done();
        });

        it('should work with a nested array of objects', (done) => {
            doc = {
                features: [
                    { feature: 'A/C' },
                    { feature: 'Radio' }
                ]
            };
            let returnVal = path.evaluatePath(doc, 'features.feature');
            returnVal.should.deepEqual(['A/C', 'Radio']);
            done();
        });

        it('should work with multiple levels of nested arrays containing objects', (done) => {
            doc = {
                features: [
                    {
                        packages: [
                            {name: 'Base'},
                            {name: 'Premium'}
                        ]
                    },
                    {
                        packages: [
                            {name: 'Convenience'},
                            {name: 'Premium'},
                            5
                        ]
                    }
                ]
            };
            let returnVal = path.evaluatePath(doc, 'features.packages.name');
            returnVal.should.deepEqual([['Base', 'Premium'], ['Convenience', 'Premium', undefined]]);
            done();
        });

        it('should work with an array of objects', (done) => {
            doc = [
                { feature: 'A/C' },
                { feature: 'Radio' }
            ];
            let returnVal = path.evaluatePath(doc, 'feature');
            returnVal.should.deepEqual(['A/C', 'Radio']);
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
            path.evaluatePath(doc, 'a.a').should.equal(1);
            path.evaluatePath(doc, 'a.b').should.equal(2);
            // Nested dot paths:
            path.evaluatePath(doc, 'a\\.a').should.equal('a');
            path.evaluatePath(doc, 'a\\.b.c\\.d').should.equal('4');
            path.evaluatePath(doc, 'a\\.b.c').should.equal('5');
            path.evaluatePath(doc, 'a\\.b.c\\.f').should.equal('6');
            path.evaluatePath(doc, 'a.b\\.c\\.d').should.equal(32);
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

            path.evaluatePath(doc, 'A.B').should.equal(false);
            path.evaluatePath(doc, 'B.C').should.equal(true);
            path.evaluatePath(doc, 'C.D').should.equal(1);
            path.evaluatePath(doc, 'D.E').should.equal(0);

            done();
        });
    });

    describe('setPath', () => {
        beforeEach(() => {
            doc = {};
        });

        it('should get a non-nested property that exists', function(done) {
            let returnVal = path.setPath(doc, 'testProperty', 'null');
            assert.equal(returnVal, doc);
            done();
        });

        it('should throw an error if no object was provided', function(done) {
            try {
                doc = null;
                assert.equal(doc, null);
                path.setPath(doc, 'testProperty', 'null');
            } catch (err) {
                err.message.should.equal('No object was provided.');
                done();
            }
        });

        it('should get a non-nested property that exists', function(done) {
            let returnVal = path.setPath(doc, 'testProperty.testProperty2', 'testValue');
            assert.equal(returnVal, doc);
            done();
        });

        it('should throw an error if no object was provided with recursive key', function(done) {
            try {
                doc = null;
                assert.equal(doc, null);
                path.setPath(doc, 'testProperty.test', 'null');
            } catch (err) {
                err.message.should.equal('No object was provided.');
                done();
            }
        });

        it('should throw an error if no key path was provided', function(done) {
            try {
                doc = {};
                let kp = null;
                assert.equal(kp, null);
                path.setPath(doc, kp, 'null');
            } catch (err) {
                err.message.should.equal('No keyPath was provided.');
                done();
            }
        });

        it('should work with multiple accesses', (done) => {
            let returnVal = path.setPath(doc, 'testProperty.testProperty2', 'testVal');
            assert.equal(returnVal, doc);
            returnVal = path.setPath(doc, 'testProperty.testProperty2', 'testVal2');
            assert.equal(returnVal, doc);
            done();
        });

        it('should work an array of objects', (done) => {
            doc = {
                features: [
                    { feature: 'A/C' },
                    { feature: 'Radio' }
                ]
            };

            let returnVal = path.setPath(doc, 'features.feature', 'None');
            returnVal.should.deepEqual({
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
                            {name: 'Base'},
                            {name: 'Premium'}
                        ]
                    },
                    {
                        packages: [
                            {name: 'Convenience'},
                            {name: 'Premium'}
                        ]
                    }
                ]
            };

            let returnVal = path.setPath(doc, 'features.packages.name', 'None');
            returnVal.should.deepEqual({
                features: [
                    {
                        packages: [
                            {name: 'None'},
                            {name: 'None'}
                        ]
                    },
                    {
                        packages: [
                            {name: 'None'},
                            {name: 'None'}
                        ]
                    }
                ]
            });
            done();
        });

        it('should protect against prototype pollution via __proto__', (done) => {
            doc = {};
            assert.equal(doc.polluted, undefined);
            path.setPath(doc, '__proto__.polluted', 'prototype-polluted');
            assert.equal(doc.__proto__.polluted, undefined);
            assert.equal(doc.polluted, undefined);
            assert.equal({}.polluted, undefined);
            assert.equal(Object.polluted, undefined);
            done();
        });

        it('should protect against prototype pollution via constructor', (done) => {
            doc = {};
            path.setPath(doc, 'constructor', 'prototype-polluted');
            assert.equal(doc.constructor, Object);

            path.setPath(doc, 'constructor.prototype.test', 'prototype-polluted');
            assert.equal(doc.test, undefined);
            assert.equal(doc.__proto__.test, undefined);
            done();
        });

        it('should protect against prototype pollution via prototype', (done) => {
            path.setPath(Object, 'prototype.test', 'prototype-polluted');
            assert.equal({}.__proto__.test, undefined);
            assert.equal(Object.prototype.test, undefined);

            path.setPath(Object, 'prototype', 'prototype-polluted');
            assert.notEqual({}.__proto__, 'prototype-polluted');
            assert.notEqual(Object.prototype, 'prototype-polluted');

            done();
        });

        it('should protect against prototype pollution even if leading dot', (done) => {
            path.setPath(Object, '.prototype.test', 'prototype-polluted');
            assert.equal({}.__proto__.test, undefined);
            assert.equal({}.test, undefined);
            done();
        });

        it('should protect against prototype pollution against a nested document', (done) => {
            doc = {};
            assert.equal(doc.polluted, undefined);
            path.setPath(doc, 'a.__proto__.polluted', 'polluted!');
            assert.equal(typeof doc.a, 'object');
            assert.equal(doc.polluted, undefined);
            assert.equal({}.polluted, undefined);
            assert.equal(Object.polluted, undefined);
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
            path.setPath(doc, 'a.a', 'b');
            doc.a.a.should.equal('b');
            doc['a.a'].should.not.equal('b');

            path.setPath(doc, 'a.b', 3);
            doc.a.b.should.equal(3);
            doc['a.b'].should.not.equal(3);

            // Nested dot paths:
            path.setPath(doc, 'a\\.a', 1);
            doc['a.a'].should.equal(1);
            doc.a.a.should.not.equal(1);

            path.setPath(doc, 'a\\.b.c\\.d', 4);
            doc['a.b']['c.d'].should.equal(4);

            path.setPath(doc, 'a\\.b.c', 5);
            doc['a.b'].c.should.equal(5);

            path.setPath(doc, 'a\\.b.c\\.f', 6);
            doc['a.b']['c.f'].should.equal(6);

            path.setPath(doc, 'a.b\\.c\\.d', 32);
            doc.a['b.c.d'].should.equal(32);

            done();
        });
    });
});
