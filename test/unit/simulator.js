'use strict';
const assert = require('power-assert');
const Simulator = require('../../lib/simulator');
const myapp = require('../support/lib/driver-myapp');

describe('simulator', () => {
    beforeEach(() => { myapp.initialize(); });

    describe('constructor()', () => {
        it('should create simulator', () => {
            let simu = new Simulator();
            assert(simu);

            assert(simu._context);
            assert(simu._equip);
            assert(simu._deco);
        });
    });

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

            let got = simu.simulateEquip([ '斬れ味レベル+1', '高級耳栓' ]).length;
            assert(got === 1737); // 頑シミュさんと同じ
        });
    });

    describe('simulateDeco()', () => {
        it('should simulate correctly', () => {
            let simu = new Simulator();

            // 装備に胴系統倍加、武器スロ、お守りがある場合
            let equip = {
                head  : myapp.equip('head', 'ユクモノカサ・天'),  // スロ2
                body  : myapp.equip('body', '三眼の首飾り'),      // スロ3
                arm   : myapp.equip('arm', 'ユクモノコテ・天'),   // スロ2
                waist : myapp.equip('waist', 'バンギスコイル'),   // 胴系統倍加
                leg   : myapp.equip('leg', 'ユクモノハカマ・天'), // スロ2
                weapon: { name: 'slot2', slot: 2, skillComb: {} },
                oma   : myapp.oma([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };
            let got = simu.simulateDeco([ '斬れ味レベル+1', '高級耳栓' ], equip).length;
            assert(got === 3);
        });
    });
});
