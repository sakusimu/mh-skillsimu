'use strict';
const assert = require('power-assert');
const Combinator = require('../../../../lib/equip/combinator');
const Context = require('../../../../lib/context');

describe('equip/combinator/_combine', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '耳栓': { name: '耳栓', tree: '聴覚保護', point: 10 },
        '斬れ味レベル+1': { name: '斬れ味レベル+1', tree: '匠', point: 10 }
    };
    let context = new Context({ skills: SKILLS });

    describe('_compress()', () => {
        let c = new Combinator(context);

        it('should compress', () => {
            let combs = [
                { eqcombs: [ 'eqcomb1' ], sumSC: { a: 2, b: 0 } },
                { eqcombs: [ 'eqcomb1' ], sumSC: { a: 0, b: 2 } },
                { eqcombs: [ 'eqcomb2' ], sumSC: { a: 2, b: 0 } },
                { eqcombs: [ 'eqcomb2' ], sumSC: { a: 0, b: 1 } }
            ];
            let got = c._compress(combs);
            let exp = [
                { eqcombs: [ 'eqcomb1', 'eqcomb2' ], sumSC: { a: 2, b: 0 } },
                { eqcombs: [ 'eqcomb1' ], sumSC: { a: 0, b: 2 } },
                { eqcombs: [ 'eqcomb2' ], sumSC: { a: 0, b: 1 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should compress if contain null', () => {
            let combs = [
                { eqcombs: [], sumSC: null },
                { eqcombs: [], sumSC: { a: 1 } }
            ];
            let got = c._compress(combs);
            let exp = [
                { eqcombs: [], sumSC: null },
                { eqcombs: [], sumSC: { a: 1 } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_sortCombs()', () => {
        let c = new Combinator(context);

        it('should sort', () => {
            let combs = [
                { sumSC: { a: 1, b: 0 } },
                { sumSC: { a: 0, b: 2 } },
                { sumSC: { a: 3, b: 0 } },
                { sumSC: { a: 1, b: 1 } },
                { sumSC: null },
                { sumSC: { a: 2, b: 0 } }
            ];
            let got = c._sortCombs(combs);
            let exp = [
                { sumSC: { a: 3, b: 0 } },
                { sumSC: { a: 0, b: 2 } },
                { sumSC: { a: 1, b: 1 } },
                { sumSC: { a: 2, b: 0 } },
                { sumSC: { a: 1, b: 0 } },
                { sumSC: null }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_combine()', () => {
        let c = new Combinator(context);

        it('should combine', () => {
            let skillNames = [ '攻撃力UP【大】', '斬れ味レベル+1', '耳栓' ];
            let bulksSet = {
                body: [
                    { skillComb: { '攻撃': 7, '匠': 0, '聴覚保護': 1 }, equips: [ '7,0,1' ] },
                    { skillComb: { '攻撃': 4, '匠': 2, '聴覚保護': 2 }, equips: [ '4,2,2' ] },
                    { skillComb: { '攻撃': 5, '匠': 2, '聴覚保護': 1 }, equips: [ '5,2,1' ] } ],
                head: [
                    { skillComb: { '攻撃': 7, '匠': 1, '聴覚保護': 1 }, equips: [ '7,1,1' ] },
                    { skillComb: { '攻撃': 5, '匠': 2, '聴覚保護': 1 }, equips: [ '5,2,1' ] },
                    { skillComb: { '攻撃': 6, '匠': 2, '聴覚保護': 0 }, equips: [ '6,2,0' ] } ],
                arm: [
                    { skillComb: { '攻撃': 6, '匠': 2, '聴覚保護': 0 }, equips: [ '6,2,0' ] },
                    { skillComb: { '攻撃': 3, '匠': 3, '聴覚保護': 1 }, equips: [ '3,3,1' ] },
                    { skillComb: { '攻撃': 4, '匠': 3, '聴覚保護': 0 }, equips: [ '4,3,0' ] } ],
                waist: [
                    { skillComb: { '攻撃': 5, '匠': 2, '聴覚保護': 1 }, equips: [ '5,2,1' ] },
                    { skillComb: { '攻撃': 2, '匠': 3, '聴覚保護': 2 }, equips: [ '2,3,2' ] },
                    { skillComb: { '攻撃': 3, '匠': 3, '聴覚保護': 1 }, equips: [ '3,3,1' ] } ],
                leg: [
                    { skillComb: { '攻撃': 6, '匠': 0, '聴覚保護': 4 }, equips: [ '6,0,4' ] },
                    { skillComb: { '攻撃': 3, '匠': 2, '聴覚保護': 4 }, equips: [ '3,2,4' ] },
                    { skillComb: { '攻撃': 4, '匠': 2, '聴覚保護': 3 }, equips: [ '4,2,3' ] } ]
            };
            let got = c._combine(skillNames, bulksSet);
            let exp = [
                {
                    eqcombs: [
                        { body  : [ '4,2,2' ],
                          head  : [ '5,2,1' ],
                          arm   : [ '3,3,1' ],
                          waist : [ '2,3,2' ],
                          leg   : [ '6,0,4' ],
                          weapon: [],
                          oma   : [],
                          bodySC: { '攻撃': 4, '匠': 2, '聴覚保護': 2 } }
                    ],
                    sumSC: { '攻撃': 20, '匠': 10, '聴覚保護': 10 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if body is [] and waist is torsoUp', () => {
            let skillNames = [ '攻撃力UP【大】', '斬れ味レベル+1', '耳栓' ];
            let bulksSet = {
                body: [],
                head: [
                    { skillComb: { '攻撃': 7, '匠': 1, '聴覚保護': 1 }, equips: [ '7,1,1' ] },
                    { skillComb: { '攻撃': 5, '匠': 2, '聴覚保護': 1 }, equips: [ '5,2,1' ] },
                    { skillComb: { '攻撃': 6, '匠': 2, '聴覚保護': 0 }, equips: [ '6,2,0' ] } ],
                arm: [
                    { skillComb: { '攻撃': 6, '匠': 2, '聴覚保護': 0 }, equips: [ '6,2,0' ] },
                    { skillComb: { '攻撃': 3, '匠': 3, '聴覚保護': 1 }, equips: [ '3,3,1' ] },
                    { skillComb: { '攻撃': 4, '匠': 3, '聴覚保護': 0 }, equips: [ '4,3,0' ] } ],
                waist: [
                    { skillComb: { '胴系統倍加': 1 }, equips: [ 'torsoUp' ] } ],
                leg: [
                    { skillComb: { '攻撃': 7, '匠': 0, '聴覚保護': 1 }, equips: [ '7,0,1' ] },
                    { skillComb: { '攻撃': 4, '匠': 2, '聴覚保護': 2 }, equips: [ '4,2,2' ] },
                    { skillComb: { '攻撃': 5, '匠': 2, '聴覚保護': 1 }, equips: [ '5,2,1' ] } ],
                weapon: [
                    { skillComb: { '攻撃': 5, '匠': 2, '聴覚保護': 1 }, equips: [ '5,2,1' ] },
                    { skillComb: { '攻撃': 2, '匠': 3, '聴覚保護': 2 }, equips: [ '2,3,2' ] },
                    { skillComb: { '攻撃': 3, '匠': 3, '聴覚保護': 1 }, equips: [ '3,3,1' ] } ],
                oma: [
                    { skillComb: { '攻撃': 6, '匠': 0, '聴覚保護': 4 }, equips: [ '6,0,4' ] },
                    { skillComb: { '攻撃': 3, '匠': 2, '聴覚保護': 4 }, equips: [ '3,2,4' ] },
                    { skillComb: { '攻撃': 4, '匠': 2, '聴覚保護': 3 }, equips: [ '4,2,3' ] } ]
            };
            let got = c._combine(skillNames, bulksSet);
            let exp = [
                {
                    eqcombs: [
                        { body  : [],
                          head  : [ '5,2,1' ],
                          arm   : [ '3,3,1' ],
                          waist : [ 'torsoUp' ],
                          leg   : [ '4,2,2' ],
                          weapon: [ '2,3,2' ],
                          oma   : [ '6,0,4' ],
                          bodySC: {} }
                    ],
                    sumSC: { '攻撃': 20, '匠': 10, '聴覚保護': 10 }
                }
            ];
            assert.deepEqual(got, exp);
        });
    });
});
