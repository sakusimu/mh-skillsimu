'use strict';
const assert = require('power-assert');
const util = require('../../../lib/util/comb');
const parts = require('../../../lib/util').parts;
const myapp = require('../../support/lib/driver-myapp');

describe('util/comb', () => {
    beforeEach(() => { myapp.initialize(); });

    describe('parts', () => {
        it('should have parts', () => {
            let got = [].concat(util.parts).sort();
            let exp = [].concat(parts).sort();
            assert.deepEqual(got, exp);
        });
    });

    describe('activates()', () => {
        it('should return true if skill activates', () => {
            let sc   = { a: 20, b: 10 };
            let goal = { a: 20, b: 10 };
            assert(util.activates(sc, goal) === true);

            sc   = { a: 19, b: 10 };
            goal = { a: 20, b: 10 };
            assert(util.activates(sc, goal) === false);

            sc   = { a: 21, b: 10 };
            goal = { a: 20, b: 10 };
            assert(util.activates(sc, goal) === true);

            sc   = { a: 20 };
            goal = { a: 20, b: 10 };
            assert(util.activates(sc, goal) === false);

            sc   = { a: 20, b: 10, '胴系統倍加': 1 };
            goal = { a: 20, b: 10 };
            assert(util.activates(sc, goal) === true);
        });

        it('should return true if already activate', () => {
            let sc   = {};
            let goal = { a: 0, b: 0 };
            let got = util.activates(sc, goal);
            assert(got === true);
        });

        it('should throw exception if goal is null', () => {
            let sc   = { a: 20, b: 10 };
            let goal = null;
            let got;
            try { util.activates(sc, goal); } catch (e) { got = e.message; }
            assert(got === 'goal is required');
        });
    });

    describe('justActivates()', () => {
        it('should return true if skill just activates', () => {
            let sc   = { a: 20, b: 10 };
            let goal = { a: 20, b: 10 };
            assert(util.justActivates(sc, goal) === true);

            sc   = { a: 19, b: 10 };
            goal = { a: 20, b: 10 };
            assert(util.justActivates(sc, goal) === false);

            sc   = { a: 21, b: 10 };
            goal = { a: 20, b: 10 };
            assert(util.justActivates(sc, goal) === false);

            sc   = { a: 20 };
            goal = { a: 20, b: 10 };
            assert(util.justActivates(sc, goal) === false);

            sc   = { a: 20, b: 10, '胴系統倍加': 1 };
            goal = { a: 20, b: 10 };
            assert(util.justActivates(sc, goal) === true);
        });

        it('should return true if already activate', () => {
            let sc   = {};
            let goal = { a: 0, b: 0 };
            assert(util.justActivates(sc, goal) === true);
        });

        it('should return true or false if goal contains minus point', () => {
            let sc   = { a: 0, b: 10 };
            let goal = { a: -1, b: 10 };
            assert(util.justActivates(sc, goal));
            sc   = { a: -1, b: 10 };
            goal = { a: -1, b: 10 };
            assert(util.justActivates(sc, goal));
            sc   = { a: -2, b: 10 };
            goal = { a: -1, b: 10 };
            assert(util.justActivates(sc, goal) === false);
        });

        it('should throw exception if goal is null', () => {
            let sc   = { a: 20, b: 10 };
            let goal = null;
            let got;
            try { util.justActivates(sc, goal); } catch (e) { got = e.message; }
            assert(got === 'goal is required');
        });
    });

    describe('isOver()', () => {
        it('should return true or false correctly', () => {
            let a = { a: 6, b: 4, c: 2 };
            let b = { a: 7, b: 4, c: 2 };
            assert(util.isOver(a, b) === true, 'over');

            a = { a: 6, b: 4, c: 2 };
            b = { a: 6, b: 4, c: 2 };
            assert(util.isOver(a, b) === true, 'over: same');

            a = { a: 6, b: 4, c: 2 };
            b = { a: 7, b: 4, c: 1 };
            assert(util.isOver(a, b) === false, 'not over');

            a = { a: 6, b: 4, c: 2 };
            b = { a: 7, b: 4 };
            assert(util.isOver(a, b) === false, 'not over: no c');
        });
    });
});
