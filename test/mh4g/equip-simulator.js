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
            myapp.data.equips = {
                head: [ myapp.equip('head', 'ユクモノカサ・天'), ],
                body: [ myapp.equip('body', '三眼の首飾り') ],
                arm: [ myapp.equip('arm', 'ユクモノコテ・天') ],
                waist: [
                    myapp.equip('waist', 'レザーベルト'),
                    myapp.equip('waist', 'バンギスコイル'),
                    myapp.equip('waist', 'シルバーソルコイル')
                ],
                leg: [ myapp.equip('leg', 'ユクモノハカマ・天') ]
            };
            context.init(myapp.data);

            let got = simu.simulate([ '斬れ味レベル+1', '砥石使用高速化' ]);
            let exp = [ { head  : 'ユクモノカサ・天',
                          body  : '三眼の首飾り',
                          arm   : 'ユクモノコテ・天',
                          waist : 'バンギスコイル',
                          leg   : 'ユクモノハカマ・天',
                          weapon: null,
                          charm : null } ];
            assert.deepEqual(got, exp);
        });

        it('should simulate dig', () => {
            myapp.setup({
                charms: [
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
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let got = simu.simulate(skillnames).length;
            assert(got === 280);
        });

        it('[ "斬れ味レベル+1", "高級耳栓" ]', () => {
            let skillnames = [ '斬れ味レベル+1', '高級耳栓' ];
            let got = simu.simulate(skillnames).length;
            assert(got === 1647); // 頑シミュさんと同じ
        });

        it('[ "攻撃力UP【大】", "業物", "集中", "見切り+1", "弱点特効" ]', () => {
            let skillnames = [ '攻撃力UP【大】', '業物', '集中', '見切り+1', '弱点特効' ];
            let got = simu.simulate(skillnames).length;
            assert(got === 0);
        });
    });
});
