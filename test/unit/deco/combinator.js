'use strict';
const assert = require('power-assert');
const Combinator = require('../../../lib/deco/combinator');
const Context = require('../../../lib/context');
const BorderLine = require('../../../lib/util').BorderLine;

describe('deco/combinator', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '業物': { name: '業物', tree: '斬れ味', point: 10 }
    };
    let context = new Context({ skills: SKILLS });

    describe('constructor()', () => {
        it('should create combinator', () => {
            let c = new Combinator(context);
            assert(c);
            assert(c.context === context);
        });

        it('should throw exception if no arguments', () => {
            let got;
            try { new Combinator(); } catch (e) { got = e.message; }
            assert(got === 'context is required');
        });
    });

    describe('_combineTorsoUp()', () => {
        let c = new Combinator(context);

        it('should combine', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                body: [
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                arm: [
                    { skillComb: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                waist: [
                    { skillComb: { '攻撃': 2, '斬れ味': 0 }, decos: [ '2,0' ], slot: 2 },
                    { skillComb: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 },
                    { skillComb: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 2 },
                    { skillComb: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                leg: [
                    { skillComb: { '胴系統倍加': 1 }, decos: [ 'torsoUp' ], slot: 0 } ],
                oma: [
                    { skillComb: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSC = { '攻撃': 13, '斬れ味': 6 };
            let borderLine = new BorderLine(context, skillNames, bulksSet, equipSC);
            let comb = {
                decombs: [
                    { head : bulksSet.head[0],
                      body : bulksSet.body[0],
                      arm  : bulksSet.arm[0],
                      waist: bulksSet.waist[3] },
                    { head : bulksSet.head[0],
                      body : bulksSet.body[0],
                      arm  : bulksSet.arm[1],
                      waist: bulksSet.waist[2] }
                ],
                sumSC: { '攻撃': 4, '斬れ味': 3 }
            };
            let bulk = bulksSet.leg[0];
            let got = c._combineTorsoUp(comb, bulk, borderLine, 'leg');
            let exp = [
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[3],
                          leg  : bulksSet.leg[0] }
                    ],
                    sumSC: { '攻撃': 7, '斬れ味': 3 }
                },
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[1],
                          waist: bulksSet.waist[2],
                          leg  : bulksSet.leg[0] }
                    ],
                    sumSC: { '攻撃': 7, '斬れ味': 3 }
                }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_brushUp()', () => {
        let c = new Combinator(context);

        it('should brush up', () => {
            let combs = [
                {
                    decombs: [
                        { head  : { decos: [ 'a1' ] },
                          body  : { decos: [ 'a3' ] },
                          arm   : { decos: [ 'a1', 'a1' ] },
                          waist : { decos: [] },
                          leg   : { decos: [ 'b2' ] },
                          weapon: { decos: [ 'b2' ] },
                          oma   : { decos: [ 'a3' ] },
                          bodySC: { 'a': 9, 'b': 4 } },
                        { head  : { decos: [ 'a1' ] },
                          body  : { decos: [ 'a3' ] },
                          arm   : { decos: [ 'a1', 'a1' ] },
                          waist : { decos: [] },
                          leg   : { decos: [ 'b2' ] },
                          //weapon: undefined,
                          oma   : null,
                          bodySC: {} }
                    ],
                    sumSC: {}
                },
                {
                    decombs: [
                        { body  : { decos: [ 'a3' ] },
                          head  : { decos: [ 'a3' ] },
                          arm   : { decos: [ 'b2' ] },
                          waist : { decos: [] },
                          leg   : null,
                          weapon: { decos: [ 'b2' ] },
                          oma: { decos: [ 'a3' ] } }
                    ],
                    sumSC: {}
                }
            ];
            let got = c._brushUp(combs);
            let exp = [
                { head  : { decos: [ 'a1' ] },
                  body  : { decos: [ 'a3' ] },
                  arm   : { decos: [ 'a1', 'a1' ] },
                  waist : { decos: [] },
                  leg   : { decos: [ 'b2' ] },
                  weapon: { decos: [ 'b2' ] },
                  oma   : { decos: [ 'a3' ] } },
                { head  : { decos: [ 'a1' ] },
                  body  : { decos: [ 'a3' ] },
                  arm   : { decos: [ 'a1', 'a1' ] },
                  waist : { decos: [] },
                  leg   : { decos: [ 'b2' ] },
                  weapon: { decos: [], slot: 0, skillComb: {} },
                  oma   : { decos: [], slot: 0, skillComb: {} } },
                { body  : { decos: [ 'a3' ] },
                  head  : { decos: [ 'a3' ] },
                  arm   : { decos: [ 'b2' ] },
                  waist : { decos: [] },
                  leg   : { decos: [], slot: 0, skillComb: {} },
                  weapon: { decos: [ 'b2' ] },
                  oma: { decos: [ 'a3' ] } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_removeOverlap()', () => {
        let c = new Combinator(context);

        it('should remove', () => {
            let decombs = [
                // a1*3, a3*2, b2*2
                { head  : { decos: [ 'a1' ] },
                  body  : { decos: [ 'a3' ] },
                  arm   : { decos: [ 'a1', 'a1' ] },
                  waist : { decos: [] },
                  leg   : { decos: [ 'b2' ] },
                  weapon: { decos: [ 'b2' ] },
                  oma   : { decos: [ 'a3' ] } },
                // a1*2, a2*1, a3*2, b2*2
                { body  : { decos: [ 'a3' ] },
                  head  : { decos: [ 'a1' ] },
                  arm   : { decos: [ 'a1', 'a2' ] },
                  waist : { decos: [] },
                  leg   : { decos: [ 'b2' ] },
                  weapon: { decos: [ 'b2' ] },
                  oma   : { decos: [ 'a3' ] } },
                // a1*3, a3*2, b2*2
                { body  : { decos: [ 'a3' ] },
                  head  : { decos: [ 'a1' ] },
                  arm   : { decos: [ 'a1', 'a1' ] },
                  waist : null,
                  leg   : { decos: [ 'b2' ] },
                  weapon: { decos: [ 'b2' ] },
                  oma   : { decos: [ 'a3' ] } },
                // a3*3, b2*2
                { body  : { decos: [ 'a3' ] },
                  head  : { decos: [ 'a3' ] },
                  arm   : { decos: [ 'b2' ] },
                  waist : { decos: [] },
                  leg   : null,
                  weapon: { decos: [ 'b2' ] },
                  oma: { decos: [ 'a3' ] } },
                // a1*3, a3*2, b2*2
                { body  : { decos: [ 'a3' ] },
                  head  : { decos: [ 'a1' ] },
                  arm   : { decos: [ 'b2' ] },
                  waist : { decos: [] },
                  leg   : { decos: [ 'a1', 'a1' ] },
                  weapon: { decos: [ 'b2' ] },
                  oma: { decos: [ 'a3' ] } }
            ];
            let got = c._removeOverlap(decombs);
            let exp = [
                // a1*3, a3*2, b2*2
                { head  : { decos: [ 'a1' ] },
                  body  : { decos: [ 'a3' ] },
                  arm   : { decos: [ 'a1', 'a1' ] },
                  waist : { decos: [] },
                  leg   : { decos: [ 'b2' ] },
                  weapon: { decos: [ 'b2' ] },
                  oma   : { decos: [ 'a3' ] } },
                // a1*2, a2*1, a3*2, b2*2
                { body  : { decos: [ 'a3' ] },
                  head  : { decos: [ 'a1' ] },
                  arm   : { decos: [ 'a1', 'a2' ] },
                  waist : { decos: [] },
                  leg   : { decos: [ 'b2' ] },
                  weapon: { decos: [ 'b2' ] },
                  oma   : { decos: [ 'a3' ] } },
                // a3*3, b2*2
                { body  : { decos: [ 'a3' ] },
                  head  : { decos: [ 'a3' ] },
                  arm   : { decos: [ 'b2' ] },
                  waist : { decos: [] },
                  leg   : null,
                  weapon: { decos: [ 'b2' ] },
                  oma: { decos: [ 'a3' ] } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_calcTotalSlot()', () => {
        let c = new Combinator(context);

        it('should calc', () => {
            let equip = {
                body  : { name: 'body', slot: 1 },
                head  : { name: 'head', slot: 2 },
                arm   : { name: 'arm', slot: 3 },
                waist : { name: 'waist', slot: 0 },
                leg   : { name: 'leg', slot: 2 },
                weapon: null,
                oma   : { name: 'oma', slot: 3 }
            };
            assert(c._calcTotalSlot(equip) === 11);
        });
    });

    describe('_groupByFreeSlot()', () => {
        let c = new Combinator(context);

        it('should group by correctly', () => {
            let decombs = [
                { body  : { slot: 1 },
                  head  : { slot: 2 },
                  arm   : { slot: 3 },
                  waist : { slot: 1 },
                  leg   : { slot: 2 },
                  weapon: null,
                  oma   : { slot: 3 } },
                { body : { slot: 0 },
                  head : { slot: 3 },
                  arm  : { slot: 3 },
                  waist: { slot: 0 },
                  // weapon がない
                  leg  : { slot: 3 },
                  oma  : { slot: 3 } },
                { body  : { slot: 2 },
                  head  : { slot: 2 },
                  arm   : { slot: 2 },
                  waist : { slot: 2 },
                  leg   : { slot: 2 },
                  weapon: { slot: 2 },
                  oma   : { slot: 2 } }
            ];
            let got = c._groupByFreeSlot(decombs, 15);
            let exp = {
                3: [
                    { body  : { slot: 1 },
                      head  : { slot: 2 },
                      arm   : { slot: 3 },
                      waist : { slot: 1 },
                      leg   : { slot: 2 },
                      weapon: null,
                      oma   : { slot: 3 } },
                    { body : { slot: 0 },
                      head : { slot: 3 },
                      arm  : { slot: 3 },
                      waist: { slot: 0 },
                      // weapon がない
                      leg  : { slot: 3 },
                      oma  : { slot: 3 } }
                ],
                1: [
                    { body  : { slot: 2 },
                      head  : { slot: 2 },
                      arm   : { slot: 2 },
                      waist : { slot: 2 },
                      leg   : { slot: 2 },
                      weapon: { slot: 2 },
                      oma   : { slot: 2 } }
                ]
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('_getJustActivated()', () => {
        let c = new Combinator(context);

        it('should return decombs just activated', () => {
            let goal = { '攻撃': 6, '斬れ味': 10 };
            let decombs = [
                // { '攻撃': 6, '斬れ味': 10 }
                { body  : { skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  head  : { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  arm   : { skillComb: { '攻撃': 2, '斬れ味': 0 } },
                  waist : { skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  leg   : { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  weapon: null,
                  oma   : { skillComb: { '攻撃': 2, '斬れ味': 0 } } },
                // { '攻撃': 6, '斬れ味': 10 }
                { body : { skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  head : { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  arm  : { skillComb: { '攻撃': 2, '斬れ味': 0 } },
                  waist: { skillComb: { '胴系統倍加': 1 } },
                  leg  : { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  // weapon がない
                  oma  : { skillComb: { '攻撃': 2, '斬れ味': 0 } } },
                // { '攻撃': 7, '斬れ味': 10 }
                { body  : { skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  head  : { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  arm   : { skillComb: { '攻撃': 2, '斬れ味': 0 } },
                  waist : { skillComb: { '胴系統倍加': 1 } },
                  leg   : { skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  weapon: { skillComb: { '攻撃': 1, '斬れ味': 0 } },
                  oma   : { skillComb: { '攻撃': 2, '斬れ味': 0 } } }
            ];
            let got = c._getJustActivated(decombs, goal);
            let exp = [ decombs[0], decombs[1] ];
            assert.deepEqual(got, exp);
        });

        it('should return decombs just activated if goal contains minus point', () => {
            // 装備で匠のポイントがオーバーしている場合
            // 組み合わせ例
            //   女性、村のみ、武器スロなし
            //   ディアブロヘルム、ガルルガメイル、フィリアアーム、
            //   ガルルガフォールド、フィリアグリーヴ
            //   龍の護石(スロ3,匠+4,氷耐性-5)
            let goal = { '匠': -1, '聴覚保護': 10 };
            let decombs = [
                { body  : { skillComb: { '匠': 0, '聴覚保護': 0 } },
                  head  : { skillComb: { '匠': 0, '聴覚保護': 2 } },
                  arm   : { skillComb: { '匠': 0, '聴覚保護': 1 } },
                  waist : { skillComb: { '匠': 0, '聴覚保護': 2 } },
                  leg   : { skillComb: { '匠': 0, '聴覚保護': 2 } },
                  weapon: null,
                  oma   : { skillComb: { '匠': 0, '聴覚保護': 3 } } }
            ];
            let got = c._getJustActivated(decombs, goal);
            let exp = [ decombs[0] ];
            assert.deepEqual(got, exp);
        });

        it('should return [] if decombs is []', () => {
            let goal = { 'hoge': 10 };
            let got = c._getJustActivated([], goal);
            assert.deepEqual(got, []);
        });
    });

    describe('_removePointOver()', () => {
        let c = new Combinator(context);

        it('should remove', () => {
            let goal = { '攻撃': 6, '斬れ味': 10 };
            let decombs = [
                // スロ13, { '攻撃': 6, '斬れ味': 10 }
                { body  : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  head  : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  arm   : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  waist : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  leg   : { slot: 0, skillComb: { '攻撃': 0, '斬れ味': 0 } },
                  weapon: null,
                  oma   : { slot: 3, skillComb: { '攻撃': 4, '斬れ味': 0 } } },
                // スロ13, { '攻撃': 7, '斬れ味': 10 }
                { body  : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  head  : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  arm   : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  waist : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  leg   : { slot: 0, skillComb: { '攻撃': 0, '斬れ味': 0 } },
                  weapon: null,
                  oma   : { slot: 3, skillComb: { '攻撃': 5, '斬れ味': 0 } } },
                // スロ14, { '攻撃': 6, '斬れ味': 10 }
                { body  : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  head  : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  arm   : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  waist : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  leg   : { slot: 2, skillComb: { '攻撃': 2, '斬れ味': 0 } },
                  //weapon: undefined,
                  oma   : { slot: 2, skillComb: { '攻撃': 2, '斬れ味': 0 } } },
                // スロ14, { '攻撃': 7, '斬れ味': 10 }
                { body  : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  head  : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  arm   : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  waist : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  leg   : { slot: 2, skillComb: { '攻撃': 2, '斬れ味': 0 } },
                  weapon: null,
                  oma   : { slot: 2, skillComb: { '攻撃': 3, '斬れ味': 0 } } }
            ];
            let got = c._removePointOver(decombs, 14, goal);
            let exp = [ decombs[0], decombs[2] ];
            assert.deepEqual(got, exp);
        });

        it('should not remove if only point over decombs', () => {
            // ちょうどスキルが発動している組み合わせがない
            let goal = { '攻撃': 6, '斬れ味': 10 };
            let decombs = [
                // スロ13, { '攻撃': 7, '斬れ味': 10 }
                { body  : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  head  : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  arm   : { slot: 2, skillComb: { '攻撃': 1, '斬れ味': 1 } },
                  waist : { slot: 3, skillComb: { '攻撃': 0, '斬れ味': 4 } },
                  leg   : { slot: 3, skillComb: { '攻撃': 5, '斬れ味': 0 } } }
            ];
            let got = c._removePointOver(decombs, 13, goal);
            let exp = [ decombs[0] ];
            assert.deepEqual(got, exp);
        });

        it('should return [] if decombs is []', () => {
            let goal = { 'hoge': 10 };
            let got = c._removePointOver([], 0, goal);
            let exp = [];
            assert.deepEqual(got, exp);
        });
    });

    describe('combine()', () => {
        let c = new Combinator(context);

        it('should return [] if null or etc', () => {
            assert.deepEqual(c.combine(), []);
            assert.deepEqual(c.combine(null), []);
            assert.deepEqual(c.combine([]), []);

            assert.deepEqual(c.combine([ '攻撃力UP【大】' ]), []);
            assert.deepEqual(c.combine([ '攻撃力UP【大】' ], null), []);
            assert.deepEqual(c.combine([ '攻撃力UP【大】' ], {}), []);
        });
    });
});
