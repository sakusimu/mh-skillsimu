'use strict';
const assert = require('power-assert');
const Simulator = require('../../lib/equip/simulator');
const Context = require('../../lib/context');
const myapp = require('../test-driver/myapp')('mh4g');

describe('mh4g/equip-simulator', () => {
    let context = new Context();
    let simu = new Simulator(context);

    beforeEach(() => { myapp.init(); });

    describe('simulate', () => {
        it('should simulate torsoUp', () => {
            myapp.setup({ hunter: { sex: 'w' } });
            let equips = myapp.data.equips;
            equips.head = [
                { name: 'ユクモノカサ・天', slot: 2,
                  skillComb: { '匠': 2, '研ぎ師': 3, '回復量': 1, '加護': 1 } }
            ];
            equips.body = [ { name: '三眼の首飾り', slot: 3, skillComb: {} } ];
            equips.arm = [
                { name: 'ユクモノコテ・天', slot: 2,
                  skillComb: { '匠': 1, '研ぎ師': 3, '回復量': 2, '加護': 3 } }
            ];
            equips.waist = [
                { name: 'レザーベルト', slot: 0,
                  skillComb: { '採取': 3, '運気': -1, '体力': 2, '気まぐれ': 1 } },
                { name: 'バンギスコイル', slot: 0, skillComb: { '胴系統倍加': 1 } },
                { name: 'シルバーソルコイル', slot: 2,
                  skillComb: { '痛撃': 2, '斬れ味': 1, '火属性攻撃': 5, '回復量': -3 } }
            ];
            equips.leg = [
                { name: 'ユクモノハカマ・天', slot: 2,
                  skillComb: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } }
            ];
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
            assert(got === 280);
        });

        it('[ "斬れ味レベル+1", "高級耳栓" ]', () => {
            let skills = [ '斬れ味レベル+1', '高級耳栓' ];
            let got = simu.simulate(skills).length;
            assert(got === 1647); // 頑シミュさんと同じ
        });

        it('[ "攻撃力UP【大】", "業物", "集中", "見切り+1", "弱点特効" ]', () => {
            let skills = [ '攻撃力UP【大】', '業物', '集中', '見切り+1', '弱点特効' ];
            let got = simu.simulate(skills).length;
            assert(got === 0);
        });
    });
});
