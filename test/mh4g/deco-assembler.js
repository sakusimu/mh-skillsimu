'use strict';
const assert = require('power-assert');
const Assembler = require('../../lib/deco/assembler');
const Context = require('../../lib/context');
const Normalizer = require('../../lib/deco/normalizer');
const Combinator = require('../../lib/deco/combinator');
const myapp = require('../support/lib/driver-myapp')('mh4g');

describe('mh4g/deco-assembler', () => {
    let context = new Context();
    let n = new Normalizer(context);
    let c = new Combinator(context);
    let a = new Assembler(context);

    beforeEach(() => {
        myapp.initialize();
        context.init(myapp.data);
    });

    describe('assemble', () => {
        function sorter(assems) {
            return assems.map(assem => {
                let sorted = {};
                Object.keys(assem).forEach(key => {
                    let decoNames = assem[key];
                    sorted[key] = decoNames.sort().reverse();
                });
                return sorted;
            });
        }

        it('should assemble if equips contain torsoUp, weaponSlot, oma', () => {
            let skills = [ '斬れ味レベル+1', '高級耳栓' ];
            let equip = {
                head  : { name: 'ユクモノカサ・天', slot: 2,
                          skillComb: { '匠': 2, '研ぎ師': 3, '回復量': 1, '加護': 1 } },
                body  : { name: '三眼の首飾り', slot: 3, skillComb: {} },
                arm   : { name: 'ユクモノコテ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 3, '回復量': 2, '加護': 3 } },
                waist : { name: 'バンギスコイル', slot: 0, skillComb: { '胴系統倍加': 1 } },
                leg   : { name: 'ユクモノハカマ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } },
                weapon: { name: 'slot2', slot: 2, skillComb: {} },
                oma   : { name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                          skillComb: { '匠': 4, '氷耐性': -5 } }
            };
            let bulksSet = n.normalize(skills, equip);
            let decombs = c.combine(skills, bulksSet, equip);

            let assems = a.assemble(decombs);
            let got = sorter(assems);
            let exp = [
                {
                    all: [
                        '防音珠【３】','防音珠【１】','防音珠【１】','防音珠【１】',
                        '防音珠【１】','防音珠【１】','防音珠【１】','防音珠【１】',
                        '匠珠【３】'],
                    torsoUp: ['防音珠【３】'],
                    rest: [
                        '防音珠【１】','防音珠【１】','防音珠【１】','防音珠【１】',
                        '防音珠【１】','防音珠【１】','防音珠【１】','匠珠【３】']
                },
                {
                    all: [
                        '防音珠【３】','防音珠【３】','防音珠【１】','防音珠【１】',
                        '防音珠【１】','匠珠【２】','匠珠【２】'],
                    torsoUp: ['防音珠【３】'],
                    rest: [
                        '防音珠【３】','防音珠【１】','防音珠【１】','防音珠【１】',
                        '匠珠【２】','匠珠【２】']
                },
                {
                    all: [
                        '防音珠【３】','防音珠【１】','防音珠【１】','防音珠【１】',
                        '防音珠【１】','防音珠【１】','防音珠【１】','防音珠【１】',
                        '匠珠【２】','匠珠【２】'],
                    torsoUp: ['防音珠【３】'],
                    rest: [
                        '防音珠【１】','防音珠【１】','防音珠【１】','防音珠【１】',
                        '防音珠【１】','防音珠【１】','防音珠【１】',
                        '匠珠【２】','匠珠【２】']
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should assemble if all equips are slot3', () => {
            // ALL三眼, 武器スロ3, お守り(匠4,スロ3)
            let skills = [ '斬れ味レベル+1', '砥石使用高速化' ];
            let equip = {
                head  : { name: '三眼のピアス', slot: 3, skillComb: {} },
                body  : { name: '三眼の首飾り', slot: 3, skillComb: {} },
                arm   : { name: '三眼の腕輪', slot: 3, skillComb: {} },
                waist : { name: '三眼の腰飾り', slot: 3, skillComb: {} },
                leg   : { name: '三眼の足輪', slot: 3, skillComb: {} },
                weapon: { name: 'slot3', slot: 3, skillComb: {} },
                oma   : { name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                          skillComb: { '匠': 4, '氷耐性': -5 } }
            };
            let bulksSet = n.normalize(skills, equip);
            let decombs = c.combine(skills, bulksSet, equip);

            let assems = a.assemble(decombs);
            let got = sorter(assems);
            let exp = [
                {
                    all: [
                        '研磨珠【１】','研磨珠【１】','研磨珠【１】','研磨珠【１】',
                        '研磨珠【１】','匠珠【３】','匠珠【３】','匠珠【３】'],
                    torsoUp: [],
                    rest: [
                        '研磨珠【１】','研磨珠【１】','研磨珠【１】','研磨珠【１】',
                        '研磨珠【１】','匠珠【３】','匠珠【３】','匠珠【３】']
                },
                {
                    all: [
                        '研磨珠【１】','研磨珠【１】','研磨珠【１】','研磨珠【１】',
                        '研磨珠【１】','匠珠【３】','匠珠【３】','匠珠【２】','匠珠【２】'],
                    torsoUp: [],
                    rest: [
                        '研磨珠【１】','研磨珠【１】','研磨珠【１】','研磨珠【１】',
                        '研磨珠【１】','匠珠【３】','匠珠【３】','匠珠【２】','匠珠【２】']
                }
            ];
            assert.deepEqual(got, exp);
        });
    });
});
