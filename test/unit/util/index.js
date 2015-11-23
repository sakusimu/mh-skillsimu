'use strict';
const assert = require('power-assert');
const util = require('../../../lib/util');

describe('util/index', () => {
    describe('export', () => {
        it('should have some properties', () => {
            assert(util.parts);
            assert(util.skill);
            assert(util.deco);
            assert(util.comb);
            assert(typeof util.BorderLine === 'function');
        });
    });

    describe('clone()', () => {
        it('should return clone object', function () {
            let got = util.clone({ a: 1, b: 2 });
            let exp = { a: 1, b: 2 };
            assert.deepEqual(got, exp);

            got = util.clone({});
            exp = {};
            assert.deepEqual(got, exp);

            got = util.clone(null);
            exp = null;
            assert.deepEqual(got, exp);

            got = util.clone();
            exp = null;
            assert.deepEqual(got, exp);
        });
    });
});
