'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../../lib/equip/normalizer');
const Context = require('../../../../lib/context');

describe('equip/normalizer/_normalize2', () => {
    let context = new Context();

    describe('_normalize2()', () => {
        let n = new Normalizer(context);

        it('should do normalize2', () => {
            let combs = {
                'ジャギィＳメイル': [
                    { '攻撃': 3, '達人': 3, '回復速度': 2, '効果持続': -2, '防御': -1 },
                    { '攻撃': 2, '達人': 3, '回復速度': 2, '効果持続': -2, '斬れ味': 1, '匠': -1 } ],
                slot0: [],
                slot2: [
                    { '攻撃': 2, '防御': -2 },
                    { '攻撃': 1, '防御': -1, '斬れ味': 1, '匠': -1 },
                    { '斬れ味': 2, '匠': -2 } ],
                'レザーベスト': [
                    { '高速収集': 3, '採取': 3, '気まぐれ': 2 } ]
            };
            let got = n._normalize2(combs, [ '攻撃', '斬れ味' ]);
            let exp = {
                'ジャギィＳメイル': [
                    { '攻撃': 3, '斬れ味': 0 },
                    { '攻撃': 2, '斬れ味': 1 } ],
                slot0: [
                    { '攻撃': 0, '斬れ味': 0 } ],
                slot2: [
                    { '攻撃': 2, '斬れ味': 0 },
                    { '攻撃': 1, '斬れ味': 1 },
                    { '攻撃': 0, '斬れ味': 2 } ],
                'レザーベスト': [
                    { '攻撃': 0, '斬れ味': 0 } ]
            };
            assert.deepEqual(got, exp);
        });

        it('should do normalize2 if contain torsoUp', () => {
            let combs = {
                'ジャギィＳグリーヴ': [
                    { '攻撃': 5, '達人': 3, '回復速度': 3, '効果持続': -1, '防御': -1 },
                    { '攻撃': 4, '達人': 3, '回復速度': 3, '効果持続': -1, '斬れ味': 1, '匠': -1 } ],
                'torsoUp': [
                    { '胴系統倍加': 1 } ],
                slot0: [],
                'シルバーソルグリーヴ': [
                    { '痛撃': 1, '斬れ味': 2, '攻撃': 5, '体力': -2, '防御': -3 },
                    { '痛撃': 1, '斬れ味': 3, '攻撃': 4, '体力': -2, '防御': -2, '匠': -1 },
                    { '痛撃': 1, '斬れ味': 4, '攻撃': 3, '体力': -2, '防御': -1, '匠': -2 },
                    { '痛撃': 1, '斬れ味': 5, '攻撃': 2, '体力': -2, '匠': -3 },
                    { '痛撃': 1, '斬れ味': 2, '攻撃': 6, '体力': -2, '防御': -2 },
                    { '痛撃': 1, '斬れ味': 3, '攻撃': 5, '体力': -2, '防御': -1, '匠': -1 },
                    { '痛撃': 1, '斬れ味': 2, '攻撃': 7, '体力': -2, '防御': -1 },
                    { '痛撃': 1, '斬れ味': 6, '攻撃': 2, '体力': -2, '匠': -2 } ]
            };
            let got = n._normalize2(combs, [ '攻撃', '斬れ味' ]);
            let exp = {
                'ジャギィＳグリーヴ': [
                    { '攻撃': 5, '斬れ味': 0 },
                    { '攻撃': 4, '斬れ味': 1 } ],
                'torsoUp': [
                    { '攻撃': 0, '斬れ味': 0, '胴系統倍加': 1 } ],
                slot0: [
                    { '攻撃': 0, '斬れ味': 0 } ],
                'シルバーソルグリーヴ': [
                    { '攻撃': 5, '斬れ味': 2 },
                    { '攻撃': 4, '斬れ味': 3 },
                    { '攻撃': 3, '斬れ味': 4 },
                    { '攻撃': 2, '斬れ味': 5 },
                    { '攻撃': 6, '斬れ味': 2 },
                    { '攻撃': 5, '斬れ味': 3 },
                    { '攻撃': 7, '斬れ味': 2 },
                    { '攻撃': 2, '斬れ味': 6 } ]
            };
            assert.deepEqual(got, exp);
        });
    });
});
