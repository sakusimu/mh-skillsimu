'use strict';
const assert = require('power-assert');
const BorderLine = require('../../../lib/util/border-line');
const Context = require('../../../lib/context');

describe('util/border-line', () => {
    const SKILLS = {
        '攻撃力UP【小】': { name: '攻撃力UP【小】', tree: '攻撃', point: 10 },
        '攻撃力UP【中】': { name: '攻撃力UP【中】', tree: '攻撃', point: 15 },
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '攻撃力UP【超】': { name: '攻撃力UP【超】', tree: '攻撃', point: 25 },
        '業物': { name: '業物', tree: '斬れ味', point: 10 },
        'なまくら': { name: 'なまくら', tree: '斬れ味', point: -10 }
    };
    let context = new Context({ skills: SKILLS });

    describe('constructor()', () => {
        it('should create borderLine', () => {
            let bl = new BorderLine(context);
            assert(bl);
            assert(bl.context === context);
        });
    });

    describe('_goal()', () => {
        let bl = new BorderLine(context);

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
        let bl = new BorderLine(context);

        it('should calc correctly', () => {
            let bulksSet = {
                head: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: { 'a': 0, 'b': 1 } } ],
                body: [
                    { skills: { 'a': 1, 'b': 1 } } ],
                arm: [
                    { skills: { 'a': 1           } },
                    { skills: {         'b': 1 } } ],
                waist: [
                    { skills: { 'a': 1         } },
                    { skills: { 'a': 2         } } ],
                leg: [
                    { skills: { 'a': 3, 'b': 2 } },
                    { skills: { 'a': 5         } },
                    { skills: {         'b': 6 } },
                    { skills: { 'a': 1, 'b': 3 } },
                    { skills: { 'a': 4, 'b': 1 } } ],
                weapon: [
                    { skills: { 'a': 1         } } ],
                charm: [
                    { skills: {         'b': 1 } } ]
            };
            let got = bl._calcMaxEachSkillPoint(bulksSet);
            let exp = {
                'a': { head: 1, body: 1, arm: 1, waist: 2, leg: 5, weapon: 1, charm: 0 },
                'b': { head: 1, body: 1, arm: 1, waist: 0, leg: 6, weapon: 0, charm: 1 }
            };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain undefined, null, []', () => {
            let bulksSet = {
                head: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: { 'a': 0, 'b': 1 } } ],
                body: [
                    { skills: { 'a': 1, 'b': 1 } } ],
                arm: null,
                waist: [],
                //let: undefined
                weapon: [
                    { skills: { 'c': 1 } } ]
            };
            let got = bl._calcMaxEachSkillPoint(bulksSet);
            let exp = {
                'a': { head: 1, body: 1, arm: 0, waist: 0, leg: 0, weapon: 0, charm: 0 },
                'b': { head: 1, body: 1, arm: 0, waist: 0, leg: 0, weapon: 0, charm: 0 },
                'c': { head: 0, body: 0, arm: 0, waist: 0, leg: 0, weapon: 1, charm: 0 }
            };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain torsoUps', () => {
            let bulksSet = {
                head: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: { 'a': 0, 'b': 1 } },
                    { skills: { '胴系統倍加': 1 } } ],
                body: [
                    { skills: { 'a': 2, 'b': 2 } } ],
                arm: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: {         'b': 2 } },
                    { skills: { 'a': 5, 'b': 0 } },
                    { skills: { '胴系統倍加': 1 } } ],
                waist: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: {         'b': 3 } },
                    // ↓胴系統倍加があるので、他のスキルのポイントは無視される
                    { skills: { 'a': 9, 'b': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { skills: { '胴系統倍加': 1 } } ]
            };
            let got = bl._calcMaxEachSkillPoint(bulksSet);
            let exp = {
                'a': { head: 2, body: 2, arm: 5, waist: 2, leg: 2, weapon: 0, charm: 0 },
                'b': { head: 2, body: 2, arm: 2, waist: 3, leg: 2, weapon: 0, charm: 0 }
            };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain torsoUps and null', () => {
            let bulksSet = {
                head: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: { 'a': 0, 'b': 1 } },
                    { skills: { '胴系統倍加': 1 } } ],
                body: null,
                arm: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: {         'b': 2 } },
                    { skills: { 'a': 5, 'b': 0 } },
                    { skills: { '胴系統倍加': 1 } } ],
                waist: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: {         'b': 3 } },
                    // ↓胴系統倍加があるので、他のスキルのポイントは無視される
                    { skills: { 'a': 9, 'b': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { skills: { '胴系統倍加': 1 } } ]
            };
            let got = bl._calcMaxEachSkillPoint(bulksSet);
            let exp = {
                'a': { head: 1, body: 0, arm: 5, waist: 1, leg: 0, weapon: 0, charm: 0 },
                'b': { head: 1, body: 0, arm: 2, waist: 3, leg: 0, weapon: 0, charm: 0 }
            };
            assert.deepEqual(got, exp);
        });

        it('should return null if null or etc', () => {
            assert(bl._calcMaxEachSkillPoint() === null);
            assert(bl._calcMaxEachSkillPoint(null) === null);
        });
    });

    describe('_calcMaxSumSkillPoint()', () => {
        let bl = new BorderLine(context);

        it('should calc correctly', () => {
            let bulksSet = {
                head: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: { 'a': 0, 'b': 1 } } ],
                body: [
                    { skills: { 'a': 1, 'b': 1 } } ],
                arm: [
                    { skills: { 'a': 1           } },
                    { skills: {         'b': 1 } } ],
                waist: [
                    { skills: { 'a': 1         } },
                    { skills: { 'a': 2         } } ],
                leg: [
                    { skills: { 'a': 3, 'b': 2 } },
                    { skills: { 'a': 5         } },
                    { skills: {         'b': 6 } },
                    { skills: { 'a': 1, 'b': 3 } },
                    { skills: { 'a': 4, 'b': 1 } } ],
                weapon: [
                    { skills: { 'a': 1         } } ],
                charm: [
                    { skills: {         'b': 1 } } ]
            };
            let got = bl._calcMaxSumSkillPoint(bulksSet);
            let exp = { head: 1, body: 2, arm: 1, waist: 2, leg: 6, weapon: 1, charm: 1 };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain undefined, null, []', () => {
            let bulksSet = {
                head: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: { 'a': 0, 'b': 1 } } ],
                body: [
                    { skills: { 'a': 1, 'b': 1 } } ],
                arm: null,
                waist: [],
                weapon: [
                    { skills: { 'c': 1 } } ]
            };
            let got = bl._calcMaxSumSkillPoint(bulksSet);
            let exp = { head: 1, body: 2, arm: 0, waist: 0, leg: 0, weapon: 1, charm: 0 };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contian torsoUps', () => {
            let bulksSet = {
                head: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: { 'a': 0, 'b': 1 } },
                    { skills: { '胴系統倍加': 1 } } ],
                body: [
                    { skills: { 'a': 2, 'b': 2 } } ],
                arm: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: {         'b': 2 } },
                    { skills: { 'a': 5, 'b': 0 } },
                    { skills: { '胴系統倍加': 1 } } ],
                waist: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: {         'b': 3 } },
                    // ↓胴系統倍加があるので、他のスキルのポイントは無視される
                    { skills: { 'a': 9, 'b': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { skills: { '胴系統倍加': 1 } } ]
            };
            let got = bl._calcMaxSumSkillPoint(bulksSet);
            let exp = { head: 4, body: 4, arm: 5, waist: 4, leg: 4, weapon: 0, charm: 0 };
            assert.deepEqual(got, exp);
        });

        it('should calc correctly if contain torsoUps and null', () => {
            let bulksSet = {
                head: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: { 'a': 0, 'b': 1 } },
                    { skills: { '胴系統倍加': 1 } } ],
                body: null,
                arm: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: {         'b': 2 } },
                    { skills: { 'a': 5, 'b': 0 } },
                    { skills: { '胴系統倍加': 1 } } ],
                waist: [
                    { skills: { 'a': 1, 'b': 0 } },
                    { skills: {         'b': 3 } },
                    // ↓胴系統倍加があるので、他のスキルのポイントは無視される
                    { skills: { 'a': 9, 'b': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { skills: { '胴系統倍加': 1 } } ]
            };
            let got = bl._calcMaxSumSkillPoint(bulksSet);
            let exp = { head: 1, body: 0, arm: 5, waist: 3, leg: 0, weapon: 0, charm: 0 };
            assert.deepEqual(got, exp);
        });

        it('should return null if null or etc', () => {
            assert(bl._calcMaxSumSkillPoint() === null);
            assert(bl._calcMaxSumSkillPoint(null) === null);
        });
    });

    describe('calcEach() & calcSum()', () => {
        it('should calc correctly', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 5, '斬れ味': 1 } } ],
                body: [
                    { skills: { '攻撃': 1, '斬れ味': 3 } } ],
                arm: [
                    { skills: { '攻撃': 5, '斬れ味': 1 } } ],
                waist: [
                    { skills: { '攻撃': 1, '斬れ味': 3 } } ],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 2 } },
                    { skills: { '攻撃': 6, '斬れ味': 0 } },
                    { skills: { '攻撃': 0, '斬れ味': 4 } },
                    { skills: { '攻撃': 1, '斬れ味': 3 } },
                    { skills: { '攻撃': 4, '斬れ味': 1 } } ],
                charm: [
                    { skills: { '攻撃': 4, '斬れ味': 0 } },
                    { skills: { '攻撃': 0, '斬れ味': 2 } } ]
            };
            let bl = new BorderLine(context, skillnames, bulksSet);

            let skills = { '攻撃': 5+1+5, '斬れ味': 1+3+1 };
            let got = bl.calcEach('waist', skills);
            let exp = {
                '攻撃': -1,  // 20 - (5+1+5) - (6+4)
                '斬れ味': -1 // 10 - (1+3+1) - (4+2)
            };
            assert.deepEqual(got, exp);
            got = bl.calcSum('waist', skills);
            exp = 4; // 30 - (11 + 5) - 6 - 4
            assert(got === exp);

            skills = { '攻撃': 5+1+5+1, '斬れ味': 1+3+1+3 };
            got = bl.calcEach('leg', skills);
            exp = {
                '攻撃': 4,  // 20 - (5+1+5+1) - (4)
                '斬れ味': 0 // 10 - (1+3+1+3) - (2)
            };
            assert.deepEqual(got, exp);
            got = bl.calcSum('leg', skills);
            exp = 6; // 30 - (12 + 8) - 4
            assert(got === exp);
        });

        it('should calc correctly if contain undefined, null, []', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 8, '斬れ味': 4 } } ],
                body: [
                    { skills: { '攻撃': 6, '斬れ味': 6 } } ],
                // arm: undefined
                waist: [],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 2 } },
                    { skills: { '攻撃': 6, '斬れ味': 0 } },
                    { skills: { '攻撃': 0, '斬れ味': 4 } },
                    { skills: { '攻撃': 1, '斬れ味': 3 } },
                    { skills: { '攻撃': 4, '斬れ味': 1 } } ]
            };
            let bl = new BorderLine(context, skillnames, bulksSet);

            let skills = { '攻撃': (8+6), '斬れ味': (4+6) };
            let got = bl.calcEach('arm', skills);
            let exp = {
                '攻撃': 0,   // 20 - (8+6) - (6)
                '斬れ味': -4 // 10 - (4+6) - (4)
            };
            assert.deepEqual(got, exp);
            got = bl.calcSum('arm', skills);
            exp = 0; // 30 - (14 + 10) - 6
            assert(got === exp);
        });

        it('should calc correctly if contain torsoUps', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skills: { '胴系統倍加': 1 } } ],
                body: [
                    { skills: { '攻撃': 4, '斬れ味': 2 } } ],
                arm: [
                    { skills: { '攻撃': 3, '斬れ味': 3 } } ],
                waist: [
                    { skills: { '攻撃': 5, '斬れ味': 1 } },
                    { skills: { '攻撃': 3, '斬れ味': 2 } } ],
                leg: [
                    { skills: { '攻撃': 5, '斬れ味': 0 } },
                    { skills: { '攻撃': 3, '斬れ味': 3 } },
                    { skills: { '攻撃': 0, '斬れ味': 4 } },
                    { skills: { '胴系統倍加': 1 } } ]
            };
            let bl = new BorderLine(context, skillnames, bulksSet);

            let skills = { '攻撃': (4+4+3), '斬れ味': (2+2+3) };
            let got = bl.calcEach('waist', skills);
            let exp = {
                '攻撃': 4,   // 20 - (4+4+3) - (5)
                '斬れ味': -1 // 10 - (2+2+3) - (4)
            };
            assert.deepEqual(got, exp);
            got = bl.calcSum('waist', skills);
            exp = 6; // 30 - (11 + 7) - (6=胴系統倍加)
            assert(got === exp);
        });

        it('should calc correctly if contain torsoUps and null', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skills: { '胴系統倍加': 1 } } ],
                body: null,
                arm: [
                    { skills: { '攻撃': 8, '斬れ味': 3 } } ],
                waist: [
                    { skills: { '攻撃': 4, '斬れ味': 2 } } ],
                leg: [
                    { skills: { '攻撃': 5, '斬れ味': 0 } },
                    { skills: { '攻撃': 4, '斬れ味': 2 } },
                    { skills: { '攻撃': 0, '斬れ味': 4 } },
                    { skills: { '胴系統倍加': 1 } } ],
                charm: [
                    { skills: { '攻撃': 4, '斬れ味': 3 } } ]
            };
            let bl = new BorderLine(context, skillnames, bulksSet);

            let skills = { '攻撃': (0+0+8), '斬れ味': (0+0+3) };
            let got = bl.calcEach('waist', skills);
            let exp = {
                '攻撃': 3,  // 20 - (8) - (5+4)
                '斬れ味': 0 // 斬れ味: 10 - (3) - (4+3)
            };
            assert.deepEqual(got, exp);
            got = bl.calcSum('waist', skills);
            exp = 6; // 30 - (8 + 3) - (6 + 7)
            assert(got === exp);
        });

        it('should calc correctly if skills is null', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 5, '斬れ味': 1 } } ],
                body: [
                    { skills: { '攻撃': 1, '斬れ味': 3 } } ],
                arm: [
                    { skills: { '攻撃': 5, '斬れ味': 1 } } ],
                waist: [
                    { skills: { '攻撃': 1, '斬れ味': 3 } } ],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 2 } },
                    { skills: { '攻撃': 6, '斬れ味': 0 } },
                    { skills: { '攻撃': 0, '斬れ味': 4 } },
                    { skills: { '攻撃': 1, '斬れ味': 3 } },
                    { skills: { '攻撃': 4, '斬れ味': 1 } } ],
                charm: [
                    { skills: { '攻撃': 4, '斬れ味': 0 } },
                    { skills: { '攻撃': 0, '斬れ味': 2 } } ]
            };
            let bl = new BorderLine(context, skillnames, bulksSet);

            let got = bl.calcEach('body', null);
            let exp = {
                '攻撃': -1,  // 20 - (5+5+1+6+4)
                '斬れ味': -1 // 10 - (1+1+3+4+2)
            };
            assert.deepEqual(got, exp);
            got = bl.calcSum('body', null);
            exp = 4; // 30 - (11 + 5) - 6 - 4
            assert(got === exp);
        });

        it('should calc correctly if specify subtracted', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let subtracted = { '攻撃': 3, '斬れ味': 3 };
            let bulksSet = {
                head: [
                    { skills: { '胴系統倍加': 1 } } ],
                body: [
                    { skills: { '攻撃': 4, '斬れ味': 2 } } ],
                arm: null,
                waist: [
                    { skills: { '攻撃': 5, '斬れ味': 1 } },
                    { skills: { '攻撃': 3, '斬れ味': 2 } } ],
                leg: [
                    { skills: { '攻撃': 5, '斬れ味': 0 } },
                    { skills: { '攻撃': 3, '斬れ味': 3 } },
                    { skills: { '攻撃': 0, '斬れ味': 4 } },
                    { skills: { '胴系統倍加': 1 } } ]
            };
            let bl = new BorderLine(context, skillnames, bulksSet, subtracted);

            let skills = { '攻撃': (4+4+0), '斬れ味': (2+2+0) };
            let got = bl.calcEach('waist', skills);
            let exp = {
                '攻撃': 4,   // (20-3) - (4+4+0) - (5)
                '斬れ味': -1 // (10-3) - (2+2+0) - (4)
            };
            assert.deepEqual(got, exp);
            got = bl.calcSum('waist', skills);
            exp = 6; // (30-3-3) - (8 + 4) - (6=胴系統倍加)
            assert(got === exp);
        });
    });
});
