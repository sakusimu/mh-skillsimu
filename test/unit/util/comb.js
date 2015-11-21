'use strict';
const assert = require('power-assert');
const util = require('../../../lib/util/comb');
const parts = require('../../../lib/util').parts;

describe('util/comb', () => {
    describe('parts', () => {
        it('should have parts', () => {
            let got = [].concat(util.parts).sort();
            let exp = [].concat(parts).sort();
            assert.deepEqual(got, exp);
        });
    });

    describe('activates()', () => {
        it('should return true if skill activates', () => {
            let skills = { a: 20, b: 10 };
            let goal   = { a: 20, b: 10 };
            assert(util.activates(skills, goal) === true);

            skills = { a: 19, b: 10 };
            goal   = { a: 20, b: 10 };
            assert(util.activates(skills, goal) === false);

            skills = { a: 21, b: 10 };
            goal   = { a: 20, b: 10 };
            assert(util.activates(skills, goal) === true);

            skills = { a: 20 };
            goal   = { a: 20, b: 10 };
            assert(util.activates(skills, goal) === false);

            skills = { a: 20, b: 10, '胴系統倍加': 1 };
            goal   = { a: 20, b: 10 };
            assert(util.activates(skills, goal) === true);
        });

        it('should return true if already activate', () => {
            let skills = {};
            let goal   = { a: 0, b: 0 };
            let got = util.activates(skills, goal);
            assert(got === true);
        });

        it('should throw exception if goal is null', () => {
            let skills = { a: 20, b: 10 };
            let got;
            try { util.activates(skills, null); } catch (e) { got = e.message; }
            assert(got === 'goal is required');
        });
    });

    describe('justActivates()', () => {
        it('should return true if skill just activates', () => {
            let skills = { a: 20, b: 10 };
            let goal   = { a: 20, b: 10 };
            assert(util.justActivates(skills, goal) === true);

            skills = { a: 19, b: 10 };
            goal   = { a: 20, b: 10 };
            assert(util.justActivates(skills, goal) === false);

            skills = { a: 21, b: 10 };
            goal   = { a: 20, b: 10 };
            assert(util.justActivates(skills, goal) === false);

            skills = { a: 20 };
            goal   = { a: 20, b: 10 };
            assert(util.justActivates(skills, goal) === false);

            skills = { a: 20, b: 10, '胴系統倍加': 1 };
            goal   = { a: 20, b: 10 };
            assert(util.justActivates(skills, goal) === true);
        });

        it('should return true if already activate', () => {
            let skills = {};
            let goal   = { a: 0, b: 0 };
            assert(util.justActivates(skills, goal) === true);
        });

        it('should return true or false if goal contains minus point', () => {
            let skills = { a: 0, b: 10 };
            let goal   = { a: -1, b: 10 };
            assert(util.justActivates(skills, goal));
            skills = { a: -1, b: 10 };
            goal   = { a: -1, b: 10 };
            assert(util.justActivates(skills, goal));
            skills = { a: -2, b: 10 };
            goal   = { a: -1, b: 10 };
            assert(util.justActivates(skills, goal) === false);
        });

        it('should throw exception if goal is null', () => {
            let skills = { a: 20, b: 10 };
            let got;
            try { util.justActivates(skills, null); } catch (e) { got = e.message; }
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
