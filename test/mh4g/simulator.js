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
                head  : { name: 'ユクモノカサ・天', slot: 2,
                          skills: { '匠': 2, '研 ぎ師': 3, '回復量': 1, '加護': 1 } },
                body  : { name: '三眼の首飾り', slot: 3, skills: {} },
                arm   : { name: 'ユクモノコテ・天', slot: 2,
                          skills: { '匠': 1, '研ぎ師': 3, '回復量': 2, '加護': 3 } },
                waist : { name: 'バンギスコイル', slot: 0, skills: { '胴系統倍加': 1 } },
                leg   : { name: 'ユクモノハカマ・天', slot: 2,
                          skills: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } },
                weapon: { name: 'slot2', slot: 2, skills: {} },
                charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };
            let got = simu.simulateDeco([ '斬れ味レベル+1', '高級耳栓' ], equip).length;
            assert(got === 3);
        });
    });
});
