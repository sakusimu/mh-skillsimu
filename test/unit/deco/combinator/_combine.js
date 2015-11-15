'use strict';
const assert = require('power-assert');
const Combinator = require('../../../../lib/deco/combinator');
const Context = require('../../../../lib/context');
const BorderLine = require('../../../../lib/util').BorderLine;

describe('deco/combinator/_combine', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '業物': { name: '業物', tree: '斬れ味', point: 10 }
    };
    let context = new Context({ skills: SKILLS });

    describe('_compress()', () => {
        let c = new Combinator(context);

        it('should compress', () => {
            let combs = [
                { decombs: [ 'decomb1' ], sumSC: { a: 2, b: 0 } },
                { decombs: [ 'decomb1' ], sumSC: { a: 0, b: 2 } },
                { decombs: [ 'decomb2' ], sumSC: { a: 2, b: 0 } },
                { decombs: [ 'decomb2' ], sumSC: { a: 0, b: 1 } }
            ];
            let got = c._compress(combs);
            let exp = [
                { decombs: [ 'decomb1', 'decomb2' ], sumSC: { a: 2, b: 0 } },
                { decombs: [ 'decomb1' ], sumSC: { a: 0, b: 2 } },
                { decombs: [ 'decomb2' ], sumSC: { a: 0, b: 1 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should compress if combs contain null', () => {
            let combs = [
                { decombs: [], sumSC: null },
                { decombs: [], sumSC: { a: 1 } }
            ];
            let got = c._compress(combs);
            let exp = [
                { decombs: [], sumSC: null },
                { decombs: [], sumSC: { a: 1 } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_filter()', () => {
        let c = new Combinator(context);

        it('should filter', () => {
            let combs = [
                { sumSC: { '攻撃': 12, '斬れ味': 4 } },
                { sumSC: { '攻撃': 12, '斬れ味': 5 } },
                { sumSC: { '攻撃': 12, '斬れ味': 6 } }
            ];
            let goal = { '攻撃': 12, '斬れ味': 5 };
            let got = c._filter(combs, goal);
            let exp = [
                { sumSC: { '攻撃': 12, '斬れ味': 5 } },
                { sumSC: { '攻撃': 12, '斬れ味': 6 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should filter if skill already activates', () => {
            let combs = [ { decombs: [], sumSC: {} } ];
            let goal = { '攻撃': 0, '斬れ味': 0 };
            let got = c._filter(combs, goal);
            let exp = [ { decombs: [], sumSC: {} } ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_combine()', () => {
        let c = new Combinator(context);

        it('should combine', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                body: [
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                arm: [
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                waist: [
                    { skillComb: { '攻撃': 2, '斬れ味': 0 }, decos: [ '2,0' ], slot: 2 },
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 },
                    { skillComb: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 2 },
                    { skillComb: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                leg: [
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                oma: [
                    { skillComb: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSC = { '攻撃': 13, '斬れ味': 6 };
            let borderLine = new BorderLine(context, skillNames, bulksSet, equipSC);
            let got = c._combine(bulksSet, borderLine);
            let exp = [
                {
                    decombs: [
                        { head  : bulksSet.head[0],
                          body  : bulksSet.body[0],
                          arm   : bulksSet.arm[0],
                          waist : bulksSet.waist[2],
                          leg   : bulksSet.leg[0],
                          weapon: { decos: [], slot: 0, skillComb: {} },
                          oma   : bulksSet.oma[1] },
                        { head  : bulksSet.head[0],
                          body  : bulksSet.body[0],
                          arm   : bulksSet.arm[0],
                          waist : bulksSet.waist[3],
                          leg   : bulksSet.leg[0],
                          weapon: { decos: [], slot: 0, skillComb: {} },
                          oma   : bulksSet.oma[0] }
                    ],
                    sumSC: { '攻撃': 7, '斬れ味': 4 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if body is [] and leg is torsoUp', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                body: [],
                arm: [
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                waist: [
                    { skillComb: { '攻撃': 2, '斬れ味': 0 }, decos: [ '2,0' ], slot: 2 },
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 },
                    { skillComb: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 2 },
                    { skillComb: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                leg: [
                    { skillComb: { '胴系統倍加': 1 }, decos: [ 'torsoUp' ], slot: 0 } ],
                weapon: [
                    { skillComb: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                oma: [
                    { skillComb: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSC = { '攻撃': 13, '斬れ味': 6 };
            let borderLine = new BorderLine(context, skillNames, bulksSet, equipSC);
            let got = c._combine(bulksSet, borderLine);
            let exp = [
                {
                    decombs: [
                        { head  : bulksSet.head[0],
                          body  : { decos: [], slot: 0, skillComb: {} },
                          arm   : bulksSet.arm[0],
                          waist : bulksSet.waist[2],
                          leg   : bulksSet.leg[0],
                          weapon: bulksSet.weapon[0],
                          oma   : bulksSet.oma[1] },
                        { head  : bulksSet.head[0],
                          body  : { decos: [], slot: 0, skillComb: {} },
                          arm   : bulksSet.arm[0],
                          waist : bulksSet.waist[3],
                          leg   : bulksSet.leg[0],
                          weapon: bulksSet.weapon[0],
                          oma   : bulksSet.oma[0] }
                    ],
                    sumSC: { '攻撃': 7, '斬れ味': 4 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if skill already activates', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                body: [
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                arm: [
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                waist: [
                    { skillComb: { '攻撃': 2, '斬れ味': 0 }, decos: [ '2,0' ], slot: 2 },
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 },
                    { skillComb: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 2 },
                    { skillComb: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                leg: [
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                oma: [
                    { skillComb: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSC = { '攻撃': 20, '斬れ味': 10 };
            let borderLine = new BorderLine(context, skillNames, bulksSet, equipSC);
            let got = c._combine(bulksSet, borderLine);
            let exp = [ { decombs: [], sumSC: {} } ];
            assert.deepEqual(got, exp);
        });
    });
});
