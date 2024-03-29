'use strict';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { evaluatePath, setPath } from '../src/path';
import assert from 'assert';

let doc: Record<string, any> = {};

describe('doc-path Module', () => {
    describe('evaluatePath', () => {
        beforeEach(() => {
            doc = {};
        });

        it('should get a non-nested property that exists', (done) => {
            doc.testProperty = 'testValue';
            const returnVal = evaluatePath(doc, 'testProperty');
            assert.equal(returnVal, 'testValue');
            done();
        });

        it('should return null if the non-nested property does not exist', (done) => {
            const returnVal = evaluatePath(doc, 'testProperty');
            assert.equal(returnVal, null);
            done();
        });

        it('should get a non-nested property that exists', (done) => {
            doc.testProperty = {
                testProperty2: 'testValue'
            };
            const returnVal = evaluatePath(doc, 'testProperty.testProperty2');
            assert.equal(returnVal, 'testValue');
            done();
        });

        it('should return null if the nested property does not exist', (done) => {
            const returnVal = evaluatePath(doc, 'testProperty.testProperty2');
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
            let returnVal = evaluatePath(doc, 'testProperty.testProperty2');
            assert.equal(returnVal, 'testVal');
            returnVal = evaluatePath(doc, 'testProperty3');
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
            const returnVal = evaluatePath(doc, 'testProperty\\.testProperty2');
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
            const returnVal = evaluatePath(doc, 'features.feature');
            assert.deepEqual(returnVal, ['A/C', 'Radio']);
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
            const returnVal = evaluatePath(doc, 'features.packages.name');
            assert.deepEqual(returnVal, [['Base', 'Premium'], ['Convenience', 'Premium', undefined]]);
            done();
        });

        it('should work with an array of objects', (done) => {
            doc = [
                { feature: 'A/C' },
                { feature: 'Radio' }
            ];
            const returnVal = evaluatePath(doc, 'feature');
            assert.deepEqual(returnVal, ['A/C', 'Radio']);
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
            assert.equal(evaluatePath(doc, 'a.a'), 1);
            assert.equal(evaluatePath(doc, 'a.b'), 2);
            // Nested dot paths:
            assert.equal(evaluatePath(doc, 'a\\.a'), 'a');
            assert.equal(evaluatePath(doc, 'a\\.b.c\\.d'), '4');
            assert.equal(evaluatePath(doc, 'a\\.b.c'), '5');
            assert.equal(evaluatePath(doc, 'a\\.b.c\\.f'), '6');
            assert.equal(evaluatePath(doc, 'a.b\\.c\\.d'), 32);
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

            assert.equal(evaluatePath(doc, 'A.B'), false);
            assert.equal(evaluatePath(doc, 'B.C'), true);
            assert.equal(evaluatePath(doc, 'C.D'), 1);
            assert.equal(evaluatePath(doc, 'D.E'), 0);

            done();
        });

        it('should return undefined if the property does not exist on an object', (done) => {
            doc = {
                name: 'list',
                features: [
                    {
                        name: 'modules'
                    },
                    {
                        pros: 'efficiency'
                    },
                    {
                        cons: ['cost', 'time']
                    }
                ]
            };
            
            assert.equal(evaluatePath(doc, 'downloads'), undefined);

            done();
        });

        it('should evaluate the properties within an array properly', (done) => {
            doc = {
                list: [{
                    a: 1
                }, {
                    a: 2
                }]
            };
            
            assert.deepEqual(evaluatePath(doc, 'list.a'), [1, 2]);

            done();
        });

        it('should evaluate the property even when an array index is included in the path', (done) => {
            doc = {
                list: [{
                    a: 1
                }, {
                    a: 2
                }]
            };
            
            assert.equal(evaluatePath(doc, 'list.0.a'), 1);
            assert.equal(evaluatePath(doc, 'list.1.a'), 2);
            assert.equal(evaluatePath(doc, 'list.2.a'), undefined);


            done();
        });

        it('should evaluate the property even when an array index is the last key in the path', (done) => {
            doc = {
                list: [{
                    a: 1
                }, {
                    a: 2
                }]
            };
            
            assert.deepEqual(evaluatePath(doc, 'list.0'), { a: 1 });
            assert.deepEqual(evaluatePath(doc, 'list.2'), undefined);

            done();
        });
    });

    describe('setPath', () => {
        beforeEach(() => {
            doc = {};
        });

        it('should get a non-nested property that exists', (done) => {
            const returnVal = setPath(doc, 'testProperty', 'null');
            assert.equal(returnVal, doc);
            done();
        });

        it('should throw an error if no object was provided', (done) => {
            try {
                const doc = null;
                assert.equal(doc, null);
                setPath(doc, 'testProperty', 'null');
            } catch (err) {
                if (err instanceof Error) {
                    assert.equal(err.message, 'No object was provided.');
                    return done();
                }
                done(err);
            }
        });

        it('should get a non-nested property that exists', (done) => {
            const returnVal = setPath(doc, 'testProperty.testProperty2', 'testValue');
            assert.equal(returnVal, doc);
            done();
        });

        it('should throw an error if no object was provided with recursive key', (done) => {
            try {
                const doc = null;
                assert.equal(doc, null);
                setPath(doc, 'testProperty.test', 'null');
            } catch (err) {
                if (err instanceof Error) {
                    assert.equal(err.message, 'No object was provided.');
                    return done();
                }
                done(err);
            }
        });

        it('should throw an error if no key path was provided', (done) => {
            try {
                doc = {};
                const kp = null;
                assert.equal(kp, null);
                setPath(doc, kp as any, 'null');
                done(new Error('Should not have succeeded'));
            } catch (err) {
                assert.equal(err instanceof Error ? err.message : '', 'No keyPath was provided.');
                done();
            }
        });

        it('should work with multiple accesses', (done) => {
            let returnVal = setPath(doc, 'testProperty.testProperty2', 'testVal');
            assert.equal(returnVal, doc);
            returnVal = setPath(doc, 'testProperty.testProperty2', 'testVal2');
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

            const returnVal = setPath(doc, 'features.feature', 'None');
            assert.deepEqual(returnVal, {
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

            const returnVal = setPath(doc, 'features.packages.name', 'None');
            assert.deepEqual(returnVal, {
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
            setPath(doc, '__proto__.polluted', 'prototype-polluted');
            assert.equal(doc.__proto__.polluted, undefined);
            assert.equal(doc.polluted, undefined);
            assert.equal(({} as Record<string, any>).polluted, undefined);
            assert.equal((Object as any).polluted, undefined);
            done();
        });

        it('should protect against prototype pollution via constructor', (done) => {
            doc = {};
            setPath(doc, 'constructor', 'prototype-polluted');
            assert.equal(doc.constructor, Object);

            setPath(doc, 'constructor.prototype.test', 'prototype-polluted');
            assert.equal(doc.test, undefined);
            assert.equal(doc.__proto__.test, undefined);
            done();
        });

        it('should protect against prototype pollution via prototype', (done) => {
            setPath(Object, 'prototype.test', 'prototype-polluted');
            assert.equal(({} as Record<string, any>).__proto__.test, undefined);
            assert.equal((Object as any).prototype.test, undefined);

            setPath(Object, 'prototype', 'prototype-polluted');
            assert.notEqual(({} as Record<string, any>).__proto__, 'prototype-polluted');
            assert.notEqual(Object.prototype, 'prototype-polluted');

            done();
        });

        it('should protect against prototype pollution even if leading dot', (done) => {
            setPath(Object, '.prototype.test', 'prototype-polluted');
            assert.equal(({} as Record<string, any>).__proto__.test, undefined);
            assert.equal(({} as Record<string, any>).test, undefined);
            done();
        });

        it('should protect against prototype pollution against a nested document', (done) => {
            doc = {};
            assert.equal(doc.polluted, undefined);
            setPath(doc, 'a.__proto__.polluted', 'polluted!');
            assert.equal(typeof doc.a, 'object');
            assert.equal(doc.polluted, undefined);
            assert.equal(({} as Record<string, any>).polluted, undefined);
            assert.equal((Object as any).polluted, undefined);
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
            setPath(doc, 'a.a', 'b');
            assert.equal(doc.a.a, 'b');
            assert.notEqual(doc['a.a'], 'b');

            setPath(doc, 'a.b', 3);
            assert.equal(doc.a.b, 3);
            assert.notEqual(doc['a.b'], 3);

            // Nested dot paths:
            setPath(doc, 'a\\.a', 1);
            assert.equal(doc['a.a'], 1);
            assert.notEqual(doc.a.a, 1);

            setPath(doc, 'a\\.b.c\\.d', 4);
            assert.equal(doc['a.b']['c.d'], 4);

            setPath(doc, 'a\\.b.c', 5);
            assert.equal(doc['a.b'].c, 5);

            setPath(doc, 'a\\.b.c\\.f', 6);
            assert.equal(doc['a.b']['c.f'], 6);

            setPath(doc, 'a.b\\.c\\.d', 32);
            assert.equal(doc.a['b.c.d'], 32);

            done();
        });

        it('should handle multiple nested levels properly', (done) => {
            setPath(doc, 'data.category', 'Computers');
            setPath(doc, 'data.options.name', 'MacBook Pro 15');
            assert.equal(doc.data.category, 'Computers');
            assert.equal(doc.data.options.name, 'MacBook Pro 15');
            done();
        });

        it('should set a value properly when an array index is specified in the key path', (done) => {
            setPath(doc, 'list.0.a', '1');
            setPath(doc, 'list.1.a', '2');
            assert.deepEqual(doc, {list: [ {a: 1}, {a: 2} ]});
            done();
        });

        it('should set a value properly when an array index is specified in the key path', (done) => {
            setPath(doc, 'list.test.0.a', '1');
            setPath(doc, 'list.test.1', '2');
            assert.deepEqual(doc, {list: {test: [ {a: 1}, 2 ]}});
            done();
        });

        it('should set a value properly when an array index is specified in the key path - beyond first index', (done) => {
            setPath(doc, 'list.1.a', '2');
            const expected = { list: [] };
            (expected.list[1] as unknown) = {a: 2};
            assert.deepEqual(doc, expected);
            done();
        });

        it('should handle a trailing `.` character in the key path as part of the key rather than as a separate key level - single level', (done) => {
            setPath(doc, 'Account No.', '1');
            assert.deepEqual(doc, { 'Account No.': '1' });
            done();
        });

        it('should handle a trailing `.` character in the key path as part of the key rather than as a separate key level - multiple levels', (done) => {
            setPath(doc, 'user.Account No.', '1');
            assert.deepEqual(doc, { user: { 'Account No.': '1' } });
            done();
        });
    });
});
