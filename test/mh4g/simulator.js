'use strict';
const assert = require('power-assert');
const Simulator = require('../../lib/simulator');
const myapp = require('../test-driver/myapp')('mh4g');

describe('mh4g/simulator', () => {
    beforeEach(() => { myapp.init(); });

    describe('init()', () => {
        it('should initialize', () => {
            let simu = new Simulator();

            assert(simu._context.equips.head.length === 0);

            simu.init(myapp.data);
            assert(simu._context.equips.head.length > 0);
        });
    });

    describe('simulateEquip()', () => {
        it('should simulate correctly', () => {
            let simu = new Simulator();
            simu.init(myapp.data);

            let got = simu.simulateEquip([ '斬れ味レベル+1', '高級耳栓' ]).length;
            assert(got === 1647); // 頑シミュさんと同じ
        });
    });

    describe('simulateDeco()', () => {
        it('should simulate correctly', () => {
            let simu = new Simulator();
            simu.init(myapp.data);

            // 装備に胴系統倍加、武器スロ、お守りがある場合
            let equip = {
                head  : myapp.equip('head', 'ユクモノカサ・天'),
                body  : myapp.equip('body', '三眼の首飾り'),
                arm   : myapp.equip('arm', 'ユクモノコテ・天'),
                waist : myapp.equip('waist', 'バンギスコイル'),
                leg   : myapp.equip('leg', 'ユクモノハカマ・天'),
                weapon: { name: 'slot2', slot: 2, skills: {} },
                charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };
            let got = simu.simulateDeco([ '斬れ味レベル+1', '高級耳栓' ], equip).length;
            assert(got === 3);
        });
    });
});
