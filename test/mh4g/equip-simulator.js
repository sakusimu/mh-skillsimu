'use strict';
const assert = require('power-assert');
const Simulator = require('../../lib/equip/simulator');
const Context = require('../../lib/context');
const data = require('../../lib/data');
const myapp = require('../support/lib/driver-myapp');

describe('mh4g/equip-simulator', () => {
    let context = new Context();
    let simu = new Simulator(context);

    beforeEach(() => { myapp.initialize(); });

    describe('simulate', () => {
        it('should simulate torsoUp', () => {
            myapp.setup({ hunter: { sex: 'w' } });
            let equips = myapp.data.equips;
            equips.head  = [ myapp.equip('head', 'ユクモノカサ・天') ];
            equips.body  = [ myapp.equip('body', '三眼の首飾り') ];
            equips.arm   = [ myapp.equip('arm', 'ユクモノコテ・天') ];
            equips.waist = [
                myapp.equip('waist', 'レザーベルト'),
                myapp.equip('waist', 'バンギスコイル'),
                myapp.equip('waist', 'シルバーソルコイル')
            ];
            equips.leg   = [ myapp.equip('leg', 'ユクモノハカマ・天') ];
            data.equips = equips;
            context.init(myapp.data);

            let got = simu.simulate([ '斬れ味レベル+1', '砥石使用高速化' ]);
            let exp = [ { head  : 'ユクモノカサ・天',
                          body  : '三眼の首飾り',
                          arm   : 'ユクモノコテ・天',
                          waist : 'バンギスコイル',
                          leg   : 'ユクモノハカマ・天',
                          weapon: null,
                          oma   : null } ];
            assert.deepEqual(got, exp);
        });

        it('should simulate dig', () => {
            myapp.setup({
                omas: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ],
                dig: true
            });
            context.init(myapp.data);

            let got = simu.simulate([ '真打', '集中', '弱点特効', '耳栓' ]).length;
            let exp = 157; // 頑シミュさんと同じ
            assert.deepEqual(got, exp);
        });
    });

    describe('simulate: summary', () => {
        beforeEach(() => { context.init(myapp.data); });

        it('[ "攻撃力UP【大】", "業物" ]', () => {
            let skills = [ '攻撃力UP【大】', '業物' ];
            let got = simu.simulate(skills).length;
            let exp = 280;
            assert(got === exp);
        });

        it('[ "斬れ味レベル+1", "高級耳栓" ]', () => {
            let skills = [ '斬れ味レベル+1', '高級耳栓' ];
            let got = simu.simulate(skills).length;
            let exp = 1737; // 頑シミュさんと同じ
            assert(got === exp);
        });

        it('[ "攻撃力UP【大】", "業物", "集中", "見切り+1", "弱点特効" ]', () => {
            let skills = [ '攻撃力UP【大】', '業物', '集中', '見切り+1', '弱点特効' ];
            let got = simu.simulate(skills).length;
            let exp = 0;
            assert(got === exp);
        });
    });
});
