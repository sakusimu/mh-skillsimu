'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../../lib/equip/normalizer');
const Context = require('../../../../lib/context');

describe('equip/normalizer/_normalize1', () => {
    const DECOS = [
        { name: '攻撃珠【１】', slot: 1, skills: { '攻撃': 1, '防御': -1 } },
        { name: '攻撃珠【２】', slot: 2, skills: { '攻撃': 3, '防御': -1 } },
        { name: '攻撃珠【３】', slot: 3, skills: { '攻撃': 5, '防御': -1 } },
        { name: '斬鉄珠【１】', slot: 1, skills: { '斬れ味': 1, '匠': -1 } },
        { name: '斬鉄珠【３】', slot: 3, skills: { '斬れ味': 4, '匠': -2 } }
    ];
    let context = new Context();

    beforeEach(() => { context.init({ decos: DECOS }); });

    describe('_normalize1()', () => {
        let n = new Normalizer(context);

        it('should do normalize1', () => {
            let equips = [
                { name: '攻撃+2,スロ1', slot: 1, skills: { '攻撃': 2, '研ぎ師': 1 } },
                { name: '攻撃+3,スロ2', slot: 2, skills: { '攻撃': 3, '火耐性': 4 } },
                { name: '斬れ味+2,スロ0', slot: 0, skills: { '斬れ味': 2, '研ぎ師': 1 } },
                { name: 'スロ0', slot: 0, skills: { '採取': 3, '気まぐれ': 2 } },
                { name: 'スロ3', slot: 3, skills: { '防御': 1, 'ガード強化': 1 } },
                { name: '三眼の首飾り', slot: 3, skills: {} },
                { name: '斬れ味+2,スロ3', slot: 3, skills: { '痛撃': 1, '斬れ味': 2 } }
            ];
            let got = n._normalize1(equips, [ '攻撃', '斬れ味' ]);
            let exp = {
                '攻撃+2,スロ1': [
                    { '攻撃': 3, '研ぎ師': 1, '防御': -1 },
                    { '攻撃': 2, '研ぎ師': 1, '斬れ味': 1, '匠': -1 } ],
                '攻撃+3,スロ2': [
                    { '攻撃': 5, '火耐性': 4, '防御': -2 },
                    { '攻撃': 4, '火耐性': 4, '防御': -1, '斬れ味': 1, '匠': -1 },
                    { '攻撃': 3, '火耐性': 4, '斬れ味': 2, '匠': -2 },
                    { '攻撃': 6, '火耐性': 4, '防御': -1 } ],
                '斬れ味+2,スロ0': [
                    { '斬れ味': 2, '研ぎ師': 1 } ],
                'スロ0': [
                    { '採取': 3, '気まぐれ': 2 } ],
                'スロ3': [
                    { '防御': -2, 'ガード強化': 1, '攻撃': 3 },
                    { '防御': -1, 'ガード強化': 1, '攻撃': 2, '斬れ味': 1, '匠': -1 },
                    { '防御': 0, 'ガード強化': 1, '攻撃': 1, '斬れ味': 2, '匠': -2 },
                    { '防御': 1, 'ガード強化': 1, '斬れ味': 3, '匠': -3 },
                    { '防御': -1, 'ガード強化': 1, '攻撃': 4 },
                    { '防御': 0, 'ガード強化': 1, '攻撃': 3, '斬れ味': 1, '匠': -1 },
                    { '防御': 0, 'ガード強化': 1, '攻撃': 5 },
                    { '防御': 1, 'ガード強化': 1, '斬れ味': 4, '匠': -2 } ],
                '三眼の首飾り': [
                    { '攻撃': 3, '防御': -3 },
                    { '攻撃': 2, '防御': -2, '斬れ味': 1, '匠': -1 },
                    { '攻撃': 1, '防御': -1, '斬れ味': 2, '匠': -2 },
                    { '斬れ味': 3, '匠': -3 },
                    { '攻撃': 4, '防御': -2 },
                    { '攻撃': 3, '防御': -1, '斬れ味': 1, '匠': -1 },
                    { '攻撃': 5, '防御': -1 },
                    { '斬れ味': 4, '匠': -2 } ],
                '斬れ味+2,スロ3': [
                    { '痛撃': 1, '斬れ味': 2, '攻撃': 3, '防御': -3 },
                    { '痛撃': 1, '斬れ味': 3, '攻撃': 2, '防御': -2, '匠': -1 },
                    { '痛撃': 1, '斬れ味': 4, '攻撃': 1, '防御': -1, '匠': -2 },
                    { '痛撃': 1, '斬れ味': 5, '匠': -3 },
                    { '痛撃': 1, '斬れ味': 2, '攻撃': 4, '防御': -2 },
                    { '痛撃': 1, '斬れ味': 3, '攻撃': 3, '防御': -1, '匠': -1 },
                    { '痛撃': 1, '斬れ味': 2, '攻撃': 5, '防御': -1 },
                    { '痛撃': 1, '斬れ味': 6, '匠': -2 } ]
            };
            assert.deepEqual(got, exp);
        });

        it('should do normalize1 if none deco', () => {
            context.decos = []; // 装飾品なし

            let equips = [
                { name: 'slot1', slot: 1, skills: {} },
                { name: 'slot0', slot: 0, skills: {} },
                { name: '攻撃+2,スロ1', slot: 1, skills: { '攻撃': 2,'研ぎ師': 1 } },
                { name: '攻撃+3,スロ2', slot: 2, skills: { '攻撃': 3,'火耐性': 4 } },
                { name: '攻撃+4,斬れ味+1,スロ0', slot: 0,
                  skills: { '攻撃': 4,'斬れ味': 1,'食事': 4,'腹減り': -2} },
                { name: 'slot3', slot: 3, skills: {} },
                { name: '斬れ味+2,スロ3', slot: 3, skills: { '痛撃': 1, '斬れ味': 2 } }
            ];
            let got = n._normalize1(equips, [ '攻撃', '斬れ味' ]);
            let exp = {
                slot1: [],
                slot0: [],
                '攻撃+2,スロ1': [
                    { '攻撃': 2,'研ぎ師': 1 } ],
                '攻撃+3,スロ2': [
                    { '攻撃': 3,'火耐性': 4 } ],
                '攻撃+4,斬れ味+1,スロ0': [
                    { '攻撃': 4,'斬れ味': 1,'食事': 4,'腹減り': -2} ],
                slot3: [],
                '斬れ味+2,スロ3': [
                    { '痛撃': 1, '斬れ味': 2 } ]
            };
            assert.deepEqual(got, exp);
        });

        it('should do normalize1 if fixed equip', () => {
            let equips = [
                { name: '三眼の首飾り', slot: 3, skills: {} }
            ];
            let got = n._normalize1(equips, [ '攻撃', '斬れ味' ]);
            let exp = {
                '三眼の首飾り': [
                    { '攻撃': 3, '防御': -3 },
                    { '攻撃': 2, '防御': -2, '斬れ味': 1, '匠': -1 },
                    { '攻撃': 1, '防御': -1, '斬れ味': 2, '匠': -2 },
                    { '斬れ味': 3, '匠': -3 },
                    { '攻撃': 4, '防御': -2 },
                    { '攻撃': 3, '防御': -1, '斬れ味': 1, '匠': -1 },
                    { '攻撃': 5, '防御': -1 },
                    { '斬れ味': 4, '匠': -2 } ]
            };
            assert.deepEqual(got, exp);

            // 胴系統倍加
            equips = [
                { name: 'バンギスコイル', slot: 0, skills: { '胴系統倍加': 1 } }
            ];
            got = n._normalize1(equips, [ '攻撃', '斬れ味' ]);
            exp = { 'バンギスコイル': [ { '胴系統倍加': 1 } ] };
            assert.deepEqual(got, exp, 'torsoUp');
        });
    });
});
