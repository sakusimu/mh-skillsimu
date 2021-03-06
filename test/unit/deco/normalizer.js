'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../lib/deco/normalizer');
const Context = require('../../../lib/context');
const util = require('../../../lib/util');

describe('deco/normalizer', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '斬れ味レベル+1': { name: '斬れ味レベル+1', tree: '匠', point: 10 },
        '砥石使用高速化': { name: '砥石使用高速化', tree: '研ぎ師', point: 10 }
    };
    const DECOS = [
        { name: '攻撃珠【１】', slot: 1, skills: { '攻撃': 1, '防御': -1 } },
        { name: '攻撃珠【２】', slot: 2, skills: { '攻撃': 3, '防御': -1 } },
        { name: '攻撃珠【３】', slot: 3, skills: { '攻撃': 5, '防御': -1 } },
        { name: '達人珠【１】', slot: 1, skills: { '達人': 1, '龍耐性': -1 } },
        { name: '達人珠【２】', slot: 2, skills: { '達人': 3, '龍耐性': -1 } },
        { name: '達人珠【３】', slot: 3, skills: { '達人': 5, '龍耐性': -1 } },
        { name: '匠珠【２】', slot: 2, skills: { '匠': 1, '斬れ味': -1 } },
        { name: '匠珠【３】', slot: 3, skills: { '匠': 2, '斬れ味': -2 } },
        { name: '斬鉄珠【１】', slot: 1, skills: { '斬れ味': 1, '匠': -1 } },
        { name: '斬鉄珠【３】', slot: 3, skills: { '斬れ味': 4, '匠': -2 } },
        { name: '斬鉄珠【３】', slot: 3, skills: { '斬れ味': 4, '匠': -2 } },
        { name: '研磨珠【１】', slot: 1, skills: { '研ぎ師': 2 } },
        { name: '採取珠【１】', slot: 1, skills: { '採取': 2 } },
        { name: '速集珠【１】', slot: 1, skills: { '高速収集': 2 } }
    ];
    let context = new Context({ decos: DECOS, skills: SKILLS });

    describe('constructor()', () => {
        it('should create normalizer', () => {
            let n = new Normalizer(context);
            assert(n);
            assert(n.context === context);
        });

        it('should throw exception if no arguments', () => {
            let got;
            try { new Normalizer(); } catch (e) { got = e.message; }
            assert(got === 'context is required');
        });
    });

    describe('_normalize1()', () => {
        let n = new Normalizer(context);

        it('should normalize if slot0', () => {
            let decosCombBySlot = util.deco.combs(DECOS, [ '研ぎ師' ]);
            let equip = { name: 'slot0', slot: 0, skills: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decosCombBySlot, equip);
            let exp = [ { decos: [], slot: 0, skills: {} } ];
            assert.deepEqual(got, exp);
        });

        it('should normalzie if slot1 and [ "研ぎ師" ]', () => {
            let decosCombBySlot = util.deco.combs(DECOS, [ '研ぎ師' ]);
            let equip = { name: 'slot1', slot: 1, skills: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decosCombBySlot, equip);
            let exp = [
                { decos: [], slot: 0, skills: {} },
                { decos: [ '研磨珠【１】' ], slot: 1, skills: { '研ぎ師': 2 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should normalzie if slot1 and [ "匠" ]', () => {
            let decosCombBySlot = util.deco.combs(DECOS, [ '匠' ]);
            let equip = { name: 'slot1', slot: 1, skills: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decosCombBySlot, equip);
            let exp = [ { decos: [], slot: 0, skills: {} } ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if slot3 and [ "匠", "研ぎ師" ]', () => {
            let decosCombBySlot = util.deco.combs(DECOS, [ '匠', '研ぎ師' ]);
            let equip = { name: 'slot3', slot: 3, skills: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decosCombBySlot, equip);
            let exp = [
                { decos: [], slot: 0, skills: {} },
                { decos: [ '研磨珠【１】' ], slot: 1, skills: { '研ぎ師': 2 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                  slot: 2, skills: { '研ぎ師': 4 } },
                { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                  slot: 3, skills: { '研ぎ師': 6 } },
                { decos: [ '匠珠【２】', '研磨珠【１】' ],
                  slot: 3, skills: { '匠': 1, '斬れ味': -1, '研ぎ師': 2 } },
                { decos: [ '匠珠【３】' ], slot: 3, skills: { '匠': 2, '斬れ味': -2 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if slot3 and [ "匠" ]', () => {
            let decosCombBySlot = util.deco.combs(DECOS, [ '匠' ]);
            let equip = { name: 'slot3', slot: 3, skills: { '攻撃': 1, '斬れ味': 1 } };
            let got = n._normalize1(decosCombBySlot, equip);
            let exp = [
                { decos: [], slot: 0, skills: {} },
                { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '匠珠【２】' ], slot: 3, skills: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '匠珠【３】' ], slot: 3, skills: { '匠': 2, '斬れ味': -2 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if contain torsoUp', () => {
            let decosCombBySlot = util.deco.combs(DECOS, [ '匠' ]);
            let equip = { name: 'torsoUp', slot: 0, skills: { '胴系統倍加': 1 } };
            let got = n._normalize1(decosCombBySlot, equip);
            let exp = [ { decos: [], slot: 0, skills: { '胴系統倍加': 1 } } ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if equip is null', () => {
            let decosCombBySlot = util.deco.combs(DECOS, [ '匠' ]);
            let got = n._normalize1(decosCombBySlot, null);
            let exp = [];
            assert.deepEqual(got, exp);
        });

        it('should normalize if equip.skills is {}', () => {
            let decosCombBySlot = util.deco.combs(DECOS, [ '匠' ]);
            let equip = { name: 'slot3', slot: 3, skills: {} };
            let got = n._normalize1(decosCombBySlot, equip);
            let exp = [
                { decos: [], slot: 0, skills: {} },
                { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '匠珠【２】' ], slot: 3, skills: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '匠珠【３】' ], slot: 3, skills: { '匠': 2, '斬れ味': -2 } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_normalize2()', () => {
        let n = new Normalizer(context);

        it('should normalize', () => {
            let bulks = [
                { decos: [], slot: 0, skills: {} },
                { decos: [ '研磨珠【１】' ], slot: 1, skills: { '研ぎ師': 2 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                  slot: 2, skills: { '研ぎ師': 4 } },
                { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '斬れ味': -1 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                  slot: 3, skills: { '研ぎ師': 6 } },
                { decos: [ '匠珠【２】', '研磨珠【１】' ],
                  slot: 3, skills: { '匠': 1, '斬れ味': -1, '研ぎ師': 2 } },
                { decos: [ '匠珠【３】' ], slot: 3, skills: { '匠': 2, '斬れ味': -2 } }
            ];
            let got = n._normalize2(bulks, [ '匠', '研ぎ師' ]);
            let exp = [
                { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                  slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } },
                { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                  slot: 3, skills: { '匠': 0, '研ぎ師': 6 } },
                { decos: [ '匠珠【２】', '研磨珠【１】' ],
                  slot: 3, skills: { '匠': 1, '研ぎ師': 2 } },
                { decos: [ '匠珠【３】' ], slot: 3, skills: { '匠': 2, '研ぎ師': 0 } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('normalize()', () => {
        let n = new Normalizer(context);

        it('should normalize', () => {
            let equips = {
                head : { name: 'ユクモノカサ・天', slot: 2,
                         skills: { '匠': 2, '研ぎ師': 3, '回復量': 1, '加護': 1 } },
                body : { name: '三眼の首飾り', slot: 3, skills: {} },
                arm  : { name: 'ユクモノコテ・天', slot: 2,
                         skills: { '匠': 1, '研ぎ師': 3, '回復量': 2, '加護': 3 } },
                waist: { name: 'バンギスコイル', slot: 0, skills: { '胴系統倍加': 1 } },
                leg  : { name: 'ユクモノハカマ・天', slot: 2,
                         skills: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } }
            };
            let got = n.normalize([ '斬れ味レベル+1', '砥石使用高速化' ], equips);
            let exp = {
                head: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } } ],
                body: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                      slot: 3, skills: { '匠': 0, '研ぎ師': 6 } },
                    { decos: [ '匠珠【２】', '研磨珠【１】' ],
                      slot: 3, skills: { '匠': 1, '研ぎ師': 2 } },
                    { decos: [ '匠珠【３】' ], slot: 3, skills: { '匠': 2, '研ぎ師': 0 } } ],
                arm: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } } ],
                waist: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } } ],
                weapon: [],
                charm: []
            };
            assert.deepEqual(got, exp);
        });

        it('should normalize if equips contain slotN, torsoUp, weapon, charm', () => {
            let equips = {
                head  : { name: 'ユクモノカサ・天', slot: 2,
                          skills: { '匠': 2, '研ぎ師': 3, '回復量': 1, '加護': 1 } },
                body  : { name: 'slot3', slot: 3, skills: {} },
                arm   : { name: 'slot0', slot: 0, skills: {} },
                waist : { name: '胴系統倍加', slot: 0, skills: { '胴系統倍加': 1 } },
                leg   : { name: 'ユクモノハカマ・天', slot: 2,
                          skills: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } },
                weapon: { name: 'slot2', slot: 2, skills: {} },
                charm : { name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                          skills: { '匠': 4, '氷耐性': -5 } }
            };
            let got = n.normalize([ '斬れ味レベル+1', '砥石使用高速化' ], equips);
            let exp = {
                head: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } } ],
                body: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                      slot: 3, skills: { '匠': 0, '研ぎ師': 6 } },
                    { decos: [ '匠珠【２】', '研磨珠【１】' ],
                      slot: 3, skills: { '匠': 1, '研ぎ師': 2 } },
                    { decos: [ '匠珠【３】' ], slot: 3, skills: { '匠': 2, '研ぎ師': 0 } } ],
                arm: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } } ],
                waist: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0, '胴系統倍加': 1 } } ],
                leg: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } } ],
                weapon: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } } ],
                charm: [
                    { decos: [], slot: 0, skills: { '匠': 0, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】' ], slot: 1, skills: { '匠': 0, '研ぎ師': 2 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】' ],
                      slot: 2, skills: { '匠': 0, '研ぎ師': 4 } },
                    { decos: [ '匠珠【２】' ], slot: 2, skills: { '匠': 1, '研ぎ師': 0 } },
                    { decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ],
                      slot: 3, skills: { '匠': 0, '研ぎ師': 6 } },
                    { decos: [ '匠珠【２】', '研磨珠【１】' ],
                      slot: 3, skills: { '匠': 1, '研ぎ師': 2 } },
                    { decos: [ '匠珠【３】' ], slot: 3, skills: { '匠': 2, '研ぎ師': 0 } } ]
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
                head: [], body: [], arm: [], waist: [],leg: [], weapon: [], charm: []
            };
            assert.deepEqual(got, exp);
        });
    });
});
