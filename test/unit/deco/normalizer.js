'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../lib/deco/normalizer');
const util = require('../../../lib/util');
const myapp = require('../../support/lib/driver-myapp');

describe('deco/normalizer', () => {
    beforeEach(() => { myapp.initialize(); });

    describe('constructor()', () => {
        let n = new Normalizer();
        assert(n);
    });

    describe('_normalize1()', () => {
        let n = new Normalizer();

        it('should normalize if slot0', () => {
            let decoCombsBySlot = util.deco.combs([ '研ぎ師' ]);
            let equip = { name: 'slot0', slot: 0, skillComb: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decoCombsBySlot, equip);
            let exp = [ { decos: [], slot: 0, skillComb: {} } ];
            assert.deepEqual(got, exp);
        });

        it('should normalzie if slot1 and [ "研ぎ師" ]', () => {
            let decoCombsBySlot = util.deco.combs([ '研ぎ師' ]);
            let equip = { name: 'slot1', slot: 1, skillComb: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decoCombsBySlot, equip);
            let exp = [
                { decos: [], slot: 0, skillComb: {} },
                { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '研ぎ師': 2 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should normalzie if slot1 and [ "匠" ]', () => {
            let decoCombsBySlot = util.deco.combs([ '匠' ]);
            let equip = { name: 'slot1', slot: 1, skillComb: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decoCombsBySlot, equip);
            let exp = [ { decos: [], slot: 0, skillComb: {} } ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if slot3 and [ "匠", "研ぎ師" ]', () => {
            let decoCombsBySlot = util.deco.combs([ '匠', '研ぎ師' ]);
            let equip = { name: 'slot3', slot: 3, skillComb: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decoCombsBySlot, equip);
            let exp = [
                { decos: [], slot: 0, skillComb: {} },
                { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '研ぎ師': 2 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                  slot: 2, skillComb: { '研ぎ師': 4 } },
                { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                  slot: 3, skillComb: { '研ぎ師': 6 } },
                { decos: [ '匠珠【２】', '研磨珠【１】' ],
                  slot: 3, skillComb: { '匠': 1, '斬れ味': -1, '研ぎ師': 2 } },
                { decos: [ '匠珠【３】' ], slot: 3, skillComb: { '匠': 2, '斬れ味': -2 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if slot3 and [ "匠" ]', () => {
            let decoCombsBySlot = util.deco.combs([ '匠' ]);
            let equip = { name: 'slot3', slot: 3, skillComb: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decoCombsBySlot, equip);
            let exp = [
                { decos: [], slot: 0, skillComb: {} },
                { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '匠珠【２】' ], slot: 3, skillComb: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '匠珠【３】' ], slot: 3, skillComb: { '匠': 2, '斬れ味': -2 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if contain torsoUp', () => {
            let decoCombsBySlot = util.deco.combs([ '匠' ]);
            let equip = { name: 'torsoUp', slot: 0, skillComb: { '胴系統倍加': 1 } };
            let got = n._normalize1(decoCombsBySlot, equip);
            let exp = [ { decos: [], slot: 0, skillComb: { '胴系統倍加': 1 } } ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if equip is null', () => {
            let decoCombsBySlot = util.deco.combs([ '匠' ]);
            let got = n._normalize1(decoCombsBySlot, null);
            let exp = [];
            assert.deepEqual(got, exp);
        });

        it('should normalize if equip.skillComb is {}', () => {
            let decoCombsBySlot = util.deco.combs([ '匠' ]);
            let equip = { name: 'slot3', slot: 3, skillComb: {} };
            let got = n._normalize1(decoCombsBySlot, equip);
            let exp = [
                { decos: [], slot: 0, skillComb: {} },
                { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '匠珠【２】' ], slot: 3, skillComb: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '匠珠【３】' ], slot: 3, skillComb: { '匠': 2, '斬れ味': -2 } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_normalize2()', () => {
        let n = new Normalizer();

        it('should normalize', () => {
            let bulks = [
                { decos: [], slot: 0, skillComb: {} },
                { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '研ぎ師': 2 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                  slot: 2, skillComb: { '研ぎ師': 4 } },
                { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                  slot: 3, skillComb: { '研ぎ師': 6 } },
                { decos: [ '匠珠【２】', '研磨珠【１】' ],
                  slot: 3, skillComb: { '匠': 1, '斬れ味': -1, '研ぎ師': 2 } },
                { decos: [ '匠珠【３】' ], slot: 3, skillComb: { '匠': 2, '斬れ味': -2 } }
            ];
            let got = n._normalize2(bulks, [ '匠', '研ぎ師' ]);
            let exp = [
                { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                  slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                  slot: 3, skillComb: { '匠': 0, '研ぎ師': 6 } },
                { decos: [ '匠珠【２】', '研磨珠【１】' ],
                  slot: 3, skillComb: { '匠': 1, '研ぎ師': 2 } },
                { decos: [ '匠珠【３】' ], slot: 3, skillComb: { '匠': 2, '研ぎ師': 0 } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('normalize()', () => {
        let n = new Normalizer();

        it('should normalize', () => {
            let equip = {
                head : { name: 'ユクモノカサ・天', slot: 2,
                         skillComb: { '匠': 2, '研ぎ師': 3, '回復量': 1, '加護': 1 } },
                body : { name: '三眼の首飾り', slot: 3, skillComb: {} },
                arm  : { name: 'ユクモノコテ・天', slot: 2,
                         skillComb: { '匠': 1, '研ぎ師': 3, '回復量': 2, '加護': 3 } },
                waist: { name: 'バンギスコイル', slot: 0, skillComb: { '胴系統倍加': 1 } },
                leg  : { name: 'ユクモノハカマ・天', slot: 2,
                         skillComb: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } }
            };
            let got = n.normalize([ '斬れ味レベル+1', '砥石使用高速化' ], equip);
            let exp = {
                head: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } } ],
                body: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                      slot: 3, skillComb: { '匠': 0, '研ぎ師': 6 } },
                    { decos: [ '匠珠【２】', '研磨珠【１】' ],
                      slot: 3, skillComb: { '匠': 1, '研ぎ師': 2 } },
                    { decos: [ '匠珠【３】' ], slot: 3, skillComb: { '匠': 2, '研ぎ師': 0 } } ],
                arm: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } } ],
                waist: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } } ],
                weapon: [],
                oma: []
            };
            assert.deepEqual(got, exp);
        });

        it('should normalize if equips contain slotN, torsoUp, weapon, oma', () => {
            let equip = {
                head  : { name: 'ユクモノカサ・天', slot: 2,
                          skillComb: { '匠': 2, '研ぎ師': 3, '回復量': 1, '加護': 1 } },
                body  : { name: 'slot3', slot: 3, skillComb: {} },
                arm   : { name: 'slot0', slot: 0, skillComb: {} },
                waist : { name: '胴系統倍加', slot: 0, skillComb: { '胴系統倍加': 1 } },
                leg   : { name: 'ユクモノハカマ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } },
                weapon: { name: 'slot2', slot: 2, skillComb: {} },
                oma   : { name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                          skillComb: { '匠': 4, '氷耐性': -5 } }
            };
            let got = n.normalize([ '斬れ味レベル+1', '砥石使用高速化' ], equip);
            let exp = {
                head: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } } ],
                body: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                      slot: 3, skillComb: { '匠': 0, '研ぎ師': 6 } },
                    { decos: [ '匠珠【２】', '研磨珠【１】' ],
                      slot: 3, skillComb: { '匠': 1, '研ぎ師': 2 } },
                    { decos: [ '匠珠【３】' ], slot: 3, skillComb: { '匠': 2, '研ぎ師': 0 } } ],
                arm: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } } ],
                waist: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } } ],
                weapon: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } } ],
                oma: [
                    { decos: [], slot: 0, skillComb: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skillComb: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skillComb: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skillComb: { '匠': 1, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                      slot: 3, skillComb: { '匠': 0, '研ぎ師': 6 } },
                    { decos: [ '匠珠【２】', '研磨珠【１】' ],
                      slot: 3, skillComb: { '匠': 1, '研ぎ師': 2 } },
                    { decos: [ '匠珠【３】' ], slot: 3, skillComb: { '匠': 2, '研ぎ師': 0 } } ]
            };
            assert.deepEqual(got, exp);
        });

        it('should normalize if null or etc', () => {
            assert(n.normalize() === null);
            assert(n.normalize(null) === null);
            assert(n.normalize([]) === null);

            assert(n.normalize([ '攻撃力UP【大】' ]) === null);
            assert(n.normalize([ '攻撃力UP【大】' ], null) === null);
            let got = n.normalize([ '攻撃力UP【大】' ], {});
            let exp = {
                head: [], body: [], arm: [], waist: [],leg: [], weapon: [], oma: []
            };
            assert.deepEqual(got, exp);
        });
    });
});
