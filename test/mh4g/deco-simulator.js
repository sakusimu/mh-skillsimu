'use strict';
const assert = require('power-assert');
const Simulator = require('../../lib/deco/simulator');
const Context = require('../../lib/context');
const myapp = require('../test-driver/myapp')('mh4g');

describe('mh4g/deco-simulator', () => {
    let context = new Context();
    let simu = new Simulator(context);

    beforeEach(() => { myapp.init(); });

    describe('simulate', () => {
        function sorter(assems) {
            return assems.map(assem => {
                let sorted = {};
                Object.keys(assem).forEach(key => {
                    let deconames = assem[key];
                    sorted[key] = deconames.sort().reverse();
                });
                return sorted;
            });
        }

        it('should simulate if contain torsoUp, weaponSlot, charm', () => {
            context.init(myapp.data);

            let equip = {
                head  : myapp.equip('head', 'ユクモノカサ・天'),
                body  : myapp.equip('body', '三眼の首飾り'),
                arm   : myapp.equip('arm', 'ユクモノコテ・天'),
                waist : myapp.equip('waist', 'バンギスコイル'),
                leg   : myapp.equip('leg', 'ユクモノハカマ・天'),
                weapon: { name: 'slot2', slot: 2, skills: {} },
                charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };

            let assems = simu.simulate([ '斬れ味レベル+1', '高級耳栓' ], equip);
            let got = sorter(assems);
            let exp = [
                {
                    body: ['防音珠【３】'],
                    any: ['防音珠【１】','防音珠【１】','防音珠【１】','防音珠【１】',
                          '防音珠【１】','防音珠【１】','防音珠【１】','匠珠【３】']
                },
                {
                    body: ['防音珠【３】'],
                    any: ['防音珠【３】','防音珠【１】','防音珠【１】','防音珠【１】',
                          '匠珠【２】','匠珠【２】']
                },
                {
                    body: ['防音珠【３】'],
                    any: ['防音珠【１】','防音珠【１】','防音珠【１】','防音珠【１】',
                          '防音珠【１】','防音珠【１】','防音珠【１】',
                          '匠珠【２】','匠珠【２】']
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should simulate if all equips are slot3', () => {
            context.init(myapp.data);

            // ALL三眼, 武器スロ3, お守り(匠4,スロ3)
            let equip = {
                head  : myapp.equip('head', '三眼のピアス'),
                body  : myapp.equip('body', '三眼の首飾り'),
                arm   : myapp.equip('arm', '三眼の腕輪'),
                waist : myapp.equip('waist', '三眼の腰飾り'),
                leg   : myapp.equip('leg', '三眼の足輪'),
                weapon: { name: 'slot3', slot: 3, skills: {} },
                charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };

            let assems = simu.simulate([ '斬れ味レベル+1', '砥石使用高速化' ], equip);
            let got = sorter(assems);
            let exp = [
                {
                    body: [],
                    any: ['研磨珠【１】','研磨珠【１】','研磨珠【１】','研磨珠【１】',
                          '研磨珠【１】','匠珠【３】','匠珠【３】','匠珠【３】']
                },
                {
                    body: [],
                    any: ['研磨珠【１】','研磨珠【１】','研磨珠【１】','研磨珠【１】',
                          '研磨珠【１】','匠珠【３】','匠珠【３】','匠珠【２】','匠珠【２】']
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should simulate if find 1 assem', () => {
            myapp.setup({ hunter: { hr: 1, vs: 6 } }); // 装飾品を村のみにしぼる
            context.init(myapp.data);

            let skillnames = [ '斬れ味レベル+1', '攻撃力UP【大】', '耳栓' ];
            let equip = {
                head  : myapp.equip('head', 'ガララキャップ'),
                body  : myapp.equip('body', 'レックスメイル'),
                arm   : myapp.equip('arm', 'ガルルガアーム'),
                waist : myapp.equip('waist', 'ゴアフォールド'),
                leg   : myapp.equip('leg', 'アークグリーヴ'),
                weapon: { name: 'slot3', slot: 3, skills: {} },
                charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };

            let assems = simu.simulate(skillnames, equip);
            let got = sorter(assems);
            let exp = [
                {
                    body: [],
                    any: ['防音珠【１】','防音珠【１】','防音珠【１】','防音珠【１】',
                          '攻撃珠【２】','攻撃珠【２】','攻撃珠【２】','攻撃珠【２】',
                          '攻撃珠【２】','攻撃珠【２】']
                }
            ];
            assert.deepEqual(got, exp);
        });
    });
});
