'use strict';
const assert = require('power-assert');
const BorderLine = require('../../../lib/util/border-line');
const myapp = require('../../support/lib/driver-myapp');

describe('util/border-line', () => {
    beforeEach(() => {
        myapp.initialize();
    });

    describe('constructor()', () => {
        it('should create borderLine', () => {
            let bl = new BorderLine();
            assert(bl);
        });
    });

    describe('_goal()', () => {
        let bl = new BorderLine();

        it('should return goal', () => {
            let got = bl._goal([ '攻撃力UP【大】', '業物' ]);
            let exp = { '攻撃': 20, '斬れ味': 10 };
            assert.deepEqual(got, exp);

            got = bl._goal([ 'なまくら' ]);
            exp = { '斬れ味': -10 };
            assert.deepEqual(got, exp);
        });

        it('should return goal if specify subtracted', () => {
            let got = bl._goal([ '攻撃力UP【大】', '業物' ], { '攻撃': 5 });
            let exp = { '攻撃': 15, '斬れ味': 10 };
            assert.deepEqual(got, exp);

            got = bl._goal([ '攻撃力UP【大】' ], { '攻撃': 5, '斬れ味': 5 });
            exp = { '攻撃': 15 };
            assert.deepEqual(got, exp);

            got = bl._goal([ 'なまくら' ], { '斬れ味': 5 });
            exp = { '斬れ味': -15 };
            assert.deepEqual(got, exp);
        });

        it('should return null if null or etc', () => {
            assert(bl._goal() === null);
            assert(bl._goal(null) === null);
        });

        it('should throw exception if skill not found', () => {
            let got;
            try { bl._goal([ '攻撃大' ]); } catch (e) { got = e.message; }
            assert(got === 'skill not found: 攻撃大');
        });
    });

    describe('_calcMaxEachSkillPoint()', () => {
        let bl = new BorderLine();

        it('should calc correctly', () => {
            let bulksSet = {
                head: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: { 'a': 0, 'b': 1 } } ],
                body: [
                    { skillComb: { 'a': 1, 'b': 1 } } ],
                arm: [
                    { skillComb: { 'a': 1           } },
                    { skillComb: {         'b': 1 } } ],
                waist: [
                    { skillComb: { 'a': 1         } },
                    { skillComb: { 'a': 2         } } ],
                leg: [
                    { skillComb: { 'a': 3, 'b': 2 } },
                    { skillComb: { 'a': 5         } },
                    { skillComb: {         'b': 6 } },
                    { skillComb: { 'a': 1, 'b': 3 } },
                    { skillComb: { 'a': 4, 'b': 1 } } ],
                weapon: [
                    { skillComb: { 'a': 1         } } ],
                oma: [
                    { skillComb: {         'b': 1 } } ]
            };
            let got = bl._calcMaxEachSkillPoint(bulksSet);
            let exp = {
                'a': { head: 1, body: 1, arm: 1, waist: 2, leg: 5, weapon: 1, oma: 0 },
                'b': { head: 1, body: 1, arm: 1, waist: 0, leg: 6, weapon: 0, oma: 1 }
            };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain undefined, null, []', () => {
            let bulksSet = {
                head: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: { 'a': 0, 'b': 1 } } ],
                body: [
                    { skillComb: { 'a': 1, 'b': 1 } } ],
                arm: null,
                waist: [],
                //let: undefined
                weapon: [
                    { skillComb: { 'c': 1 } } ]
            };
            let got = bl._calcMaxEachSkillPoint(bulksSet);
            let exp = {
                'a': { head: 1, body: 1, arm: 0, waist: 0, leg: 0, weapon: 0, oma: 0 },
                'b': { head: 1, body: 1, arm: 0, waist: 0, leg: 0, weapon: 0, oma: 0 },
                'c': { head: 0, body: 0, arm: 0, waist: 0, leg: 0, weapon: 1, oma: 0 }
            };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain torsoUps', () => {
            let bulksSet = {
                head: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: { 'a': 0, 'b': 1 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                body: [
                    { skillComb: { 'a': 2, 'b': 2 } } ],
                arm: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: {         'b': 2 } },
                    { skillComb: { 'a': 5, 'b': 0 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                waist: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: {         'b': 3 } },
                    // ↓胴系統倍加があるので、他のスキルのポイントは無視される
                    { skillComb: { 'a': 9, 'b': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { skillComb: { '胴系統倍加': 1 } } ]
            };
            let got = bl._calcMaxEachSkillPoint(bulksSet);
            let exp = {
                'a': { head: 2, body: 2, arm: 5, waist: 2, leg: 2, weapon: 0, oma: 0 },
                'b': { head: 2, body: 2, arm: 2, waist: 3, leg: 2, weapon: 0, oma: 0 }
            };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain torsoUps and null', () => {
            let bulksSet = {
                head: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: { 'a': 0, 'b': 1 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                body: null,
                arm: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: {         'b': 2 } },
                    { skillComb: { 'a': 5, 'b': 0 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                waist: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: {         'b': 3 } },
                    // ↓胴系統倍加があるので、他のスキルのポイントは無視される
                    { skillComb: { 'a': 9, 'b': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { skillComb: { '胴系統倍加': 1 } } ]
            };
            let got = bl._calcMaxEachSkillPoint(bulksSet);
            let exp = {
                'a': { head: 1, body: 0, arm: 5, waist: 1, leg: 0, weapon: 0, oma: 0 },
                'b': { head: 1, body: 0, arm: 2, waist: 3, leg: 0, weapon: 0, oma: 0 }
            };
            assert.deepEqual(got, exp);
        });

        it('should return null if null or etc', () => {
            assert(bl._calcMaxEachSkillPoint() === null);
            assert(bl._calcMaxEachSkillPoint(null) === null);
        });
    });

    describe('_calcMaxSumSkillPoint()', () => {
        let bl = new BorderLine();

        it('should calc correctly', () => {
            let bulksSet = {
                head: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: { 'a': 0, 'b': 1 } } ],
                body: [
                    { skillComb: { 'a': 1, 'b': 1 } } ],
                arm: [
                    { skillComb: { 'a': 1           } },
                    { skillComb: {         'b': 1 } } ],
                waist: [
                    { skillComb: { 'a': 1         } },
                    { skillComb: { 'a': 2         } } ],
                leg: [
                    { skillComb: { 'a': 3, 'b': 2 } },
                    { skillComb: { 'a': 5         } },
                    { skillComb: {         'b': 6 } },
                    { skillComb: { 'a': 1, 'b': 3 } },
                    { skillComb: { 'a': 4, 'b': 1 } } ],
                weapon: [
                    { skillComb: { 'a': 1         } } ],
                oma: [
                    { skillComb: {         'b': 1 } } ]
            };
            let got = bl._calcMaxSumSkillPoint(bulksSet);
            let exp = { head: 1, body: 2, arm: 1, waist: 2, leg: 6, weapon: 1, oma: 1 };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain undefined, null, []', () => {
            let bulksSet = {
                head: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: { 'a': 0, 'b': 1 } } ],
                body: [
                    { skillComb: { 'a': 1, 'b': 1 } } ],
                arm: null,
                waist: [],
                weapon: [
                    { skillComb: { 'c': 1 } } ]
            };
            let got = bl._calcMaxSumSkillPoint(bulksSet);
            let exp = { head: 1, body: 2, arm: 0, waist: 0, leg: 0, weapon: 1, oma: 0 };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contian torsoUps', () => {
            let bulksSet = {
                head: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: { 'a': 0, 'b': 1 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                body: [
                    { skillComb: { 'a': 2, 'b': 2 } } ],
                arm: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: {         'b': 2 } },
                    { skillComb: { 'a': 5, 'b': 0 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                waist: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: {         'b': 3 } },
                    // ↓胴系統倍加があるので、他のスキルのポイントは無視される
                    { skillComb: { 'a': 9, 'b': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { skillComb: { '胴系統倍加': 1 } } ]
            };
            let got = bl._calcMaxSumSkillPoint(bulksSet);
            let exp = { head: 4, body: 4, arm: 5, waist: 4, leg: 4, weapon: 0, oma: 0 };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain torsoUps and null', () => {
            let bulksSet = {
                head: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: { 'a': 0, 'b': 1 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                body: null,
                arm: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: {         'b': 2 } },
                    { skillComb: { 'a': 5, 'b': 0 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                waist: [
                    { skillComb: { 'a': 1, 'b': 0 } },
                    { skillComb: {         'b': 3 } },
                    // ↓胴系統倍加があるので、他のスキルのポイントは無視される
                    { skillComb: { 'a': 9, 'b': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { skillComb: { '胴系統倍加': 1 } } ]
            };
            let got = bl._calcMaxSumSkillPoint(bulksSet);
            let exp = { head: 1, body: 0, arm: 5, waist: 3, leg: 0, weapon: 0, oma: 0 };
            assert.deepEqual(got, exp);
        });

        it('should return null if null or etc', () => {
            assert(bl._calcMaxSumSkillPoint() === null);
            assert(bl._calcMaxSumSkillPoint(null) === null);
        });
    });

    describe('calcEach() & calcSum()', () => {
        it('should calc correctly', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '攻撃': 5, '斬れ味': 1 } } ],
                body: [
                    { skillComb: { '攻撃': 1, '斬れ味': 3 } } ],
                arm: [
                    { skillComb: { '攻撃': 5, '斬れ味': 1 } } ],
                waist: [
                    { skillComb: { '攻撃': 1, '斬れ味': 3 } } ],
                leg: [
                    { skillComb: { '攻撃': 3, '斬れ味': 2 } },
                    { skillComb: { '攻撃': 6, '斬れ味': 0 } },
                    { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                    { skillComb: { '攻撃': 1, '斬れ味': 3 } },
                    { skillComb: { '攻撃': 4, '斬れ味': 1 } } ],
                oma: [
                    { skillComb: { '攻撃': 4, '斬れ味': 0 } },
                    { skillComb: { '攻撃': 0, '斬れ味': 2 } } ]
            };
            let bl = new BorderLine(skillNames, bulksSet);
            let sc = { '攻撃': 5+1+5, '斬れ味': 1+3+1 };
            let got = bl.calcEach('waist', sc);
            // 攻撃: 20 - (5+1+5) - (6+4), 斬れ味: 10 - (1+3+1) - (4+2)
            let exp = { '攻撃': -1, '斬れ味': -1 };
            assert.deepEqual(got, exp, 'calcEach: waist');
            got = bl.calcSum('waist', sc);
            exp = 4; // 30 - (11 + 5) - 6 - 4
            assert(got === exp, 'calcSum: waist');

            sc = { '攻撃': 5+1+5+1, '斬れ味': 1+3+1+3 };
            got = bl.calcEach('leg', sc);
            // 攻撃: 20 - (5+1+5+1) - (4), 斬れ味: 10 - (1+3+1+3) - (2)
            exp = { '攻撃': 4, '斬れ味': 0 };
            assert.deepEqual(got, exp, 'calcEach: leg');
            got = bl.calcSum('leg', sc);
            exp = 6; // 30 - (12 + 8) - 4
            assert(got === exp, 'calcSum: leg');
        });

        it('should calc correctly if contain undefined, null, []', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '攻撃': 8, '斬れ味': 4 } } ],
                body: [
                    { skillComb: { '攻撃': 6, '斬れ味': 6 } } ],
                // arm: undefined
                waist: [],
                leg: [
                    { skillComb: { '攻撃': 3, '斬れ味': 2 } },
                    { skillComb: { '攻撃': 6, '斬れ味': 0 } },
                    { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                    { skillComb: { '攻撃': 1, '斬れ味': 3 } },
                    { skillComb: { '攻撃': 4, '斬れ味': 1 } } ]
            };
            let bl = new BorderLine(skillNames, bulksSet);
            let sc = { '攻撃': (8+6), '斬れ味': (4+6) };
            let got = bl.calcEach('arm', sc);
            // 攻撃: 20 - (8+6) - (6), 斬れ味: 10 - (4+6) - (4)
            let exp = { '攻撃': 0, '斬れ味': -4 };
            assert.deepEqual(got, exp, 'calcEach');
            got = bl.calcSum('arm', sc);
            exp = 0; // 30 - (14 + 10) - 6
            assert(got === exp, 'calcSum');
        });

        it('should calc correctly if contain torsoUps', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '胴系統倍加': 1 } } ],
                body: [
                    { skillComb: { '攻撃': 4, '斬れ味': 2 } } ],
                arm: [
                    { skillComb: { '攻撃': 3, '斬れ味': 3 } } ],
                waist: [
                    { skillComb: { '攻撃': 5, '斬れ味': 1 } },
                    { skillComb: { '攻撃': 3, '斬れ味': 2 } } ],
                leg: [
                    { skillComb: { '攻撃': 5, '斬れ味': 0 } },
                    { skillComb: { '攻撃': 3, '斬れ味': 3 } },
                    { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                    { skillComb: { '胴系統倍加': 1 } } ]
            };
            let bl = new BorderLine(skillNames, bulksSet);
            let sc = { '攻撃': (4+4+3), '斬れ味': (2+2+3) };
            let got = bl.calcEach('waist', sc);
            // 攻撃: 20 - (4+4+3) - (5), 斬れ味: 10 - (2+2+3) - (4)
            let exp = { '攻撃': 4, '斬れ味': -1 };
            assert.deepEqual(got, exp, 'calcEach');
            got = bl.calcSum('waist', sc);
            exp = 6; // 30 - (11 + 7) - 6(胴系統倍加)
            assert(got === exp, 'calcSum');
        });

        it('should calc correctly if contain torsoUps and null', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '胴系統倍加': 1 } } ],
                body: null,
                arm: [
                    { skillComb: { '攻撃': 8, '斬れ味': 3 } } ],
                waist: [
                    { skillComb: { '攻撃': 4, '斬れ味': 2 } } ],
                leg: [
                    { skillComb: { '攻撃': 5, '斬れ味': 0 } },
                    { skillComb: { '攻撃': 4, '斬れ味': 2 } },
                    { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                    { skillComb: { '胴系統倍加': 1 } } ],
                oma: [
                    { skillComb: { '攻撃': 4, '斬れ味': 3 } } ]
            };
            let bl = new BorderLine(skillNames, bulksSet);
            let sc = { '攻撃': (0+0+8), '斬れ味': (0+0+3) };
            let got = bl.calcEach('waist', sc);
            // 攻撃: 20 - (8) - (5+4), 斬れ味: 10 - (3) - (4+3)
            let exp = { '攻撃': 3, '斬れ味': 0 };
            assert.deepEqual(got, exp, 'calcEach');
            got = bl.calcSum('waist', sc);
            exp = 6; // 30 - (8 + 3) - (6 + 7)
            assert(got === exp, 'calcSum');
        });

        it('should calc correctly if skillComb is null', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '攻撃': 5, '斬れ味': 1 } } ],
                body: [
                    { skillComb: { '攻撃': 1, '斬れ味': 3 } } ],
                arm: [
                    { skillComb: { '攻撃': 5, '斬れ味': 1 } } ],
                waist: [
                    { skillComb: { '攻撃': 1, '斬れ味': 3 } } ],
                leg: [
                    { skillComb: { '攻撃': 3, '斬れ味': 2 } },
                    { skillComb: { '攻撃': 6, '斬れ味': 0 } },
                    { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                    { skillComb: { '攻撃': 1, '斬れ味': 3 } },
                    { skillComb: { '攻撃': 4, '斬れ味': 1 } } ],
                oma: [
                    { skillComb: { '攻撃': 4, '斬れ味': 0 } },
                    { skillComb: { '攻撃': 0, '斬れ味': 2 } } ]
            };
            let bl = new BorderLine(skillNames, bulksSet);
            let got = bl.calcEach('body', null);
            // 攻撃: 20 - (5+5+1+6+4), 斬れ味: 10 - (1+1+3+4+2)
            let exp = { '攻撃': -1, '斬れ味': -1 };
            assert.deepEqual(got, exp, 'calcEach');
            got = bl.calcSum('body', null);
            exp = 4; // 30 - (11 + 5) - 6 - 4
            assert(got === exp, 'calcSum');
        });

        it('should calc correctly if specify subtracted', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let subtracted = { '攻撃': 3, '斬れ味': 3 };
            let bulksSet = {
                head: [
                    { skillComb: { '胴系統倍加': 1 } } ],
                body: [
                    { skillComb: { '攻撃': 4, '斬れ味': 2 } } ],
                arm: null,
                waist: [
                    { skillComb: { '攻撃': 5, '斬れ味': 1 } },
                    { skillComb: { '攻撃': 3, '斬れ味': 2 } } ],
                leg: [
                    { skillComb: { '攻撃': 5, '斬れ味': 0 } },
                    { skillComb: { '攻撃': 3, '斬れ味': 3 } },
                    { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                    { skillComb: { '胴系統倍加': 1 } } ]
            };
            let bl = new BorderLine(skillNames, bulksSet, subtracted);
            let sc = { '攻撃': (4+4+0), '斬れ味': (2+2+0) };
            let got = bl.calcEach('waist', sc);
            // 攻撃: (20-3) - (4+4+0) - (5), 斬れ味: (10-3) - (2+2+0) - (4)
            let exp = { '攻撃': 4, '斬れ味': -1 };
            assert.deepEqual(got, exp, 'calcEach');
            got = bl.calcSum('waist', sc);
            exp = 6; // (30-3-3) - (8 + 4) - 6(胴系統倍加)
            assert(got === exp, 'calcSum');
        });
    });
});
