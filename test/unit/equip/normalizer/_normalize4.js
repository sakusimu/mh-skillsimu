'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../../lib/equip/normalizer');
const Context = require('../../../../lib/context');

describe('equip/normalizer/_normalize4', () => {
    let context = new Context();

    describe('_normalize4()', () => {
        let n = new Normalizer(context);

        function toString(skills) {
            let list = Object.keys(skills).sort().map(tree => {
                return tree + ':' + skills[tree];
            });
            return list.join(',');
        }
        function sorter(bulks) {
            return bulks.sort((a, b) => {
                return toString(a.skills) > toString(b.skills) ? 1 : -1;
            });
        }

        it('should do normalize4', () => {
            let combs = {
                'ジャギィＳメイル': [
                    { '攻撃': 3, '斬れ味': 0 }, { '攻撃': 2, '斬れ味': 1 } ],
                'バギィＳメイル': [
                    { '攻撃': 4, '斬れ味': 1 }, { '攻撃': 3, '斬れ味': 2 },
                    { '攻撃': 6, '斬れ味': 0 } ],
                'ジンオウメイル': [
                    { '攻撃': 0, '斬れ味': 2 } ],
                slot0: [
                    { '攻撃': 0, '斬れ味': 0 } ],
                slot3: [
                    { '攻撃': 1, '斬れ味': 2 }, { '攻撃': 3, '斬れ味': 1 },
                    { '攻撃': 5, '斬れ味': 0 }, { '攻撃': 0, '斬れ味': 4 } ],
                'シルバーソルメイル': [
                    { '攻撃': 2, '斬れ味': 2 }, { '攻撃': 1, '斬れ味': 3 },
                    { '攻撃': 4, '斬れ味': 1 } ]
            };
            let got = n._normalize4(combs);
            let exp = [
                { skills: { '攻撃': 0, '斬れ味': 0 }, equips: [ 'slot0' ] },
                { skills: { '攻撃': 0, '斬れ味': 2 }, equips: [ 'ジンオウメイル' ] },
                { skills: { '攻撃': 3, '斬れ味': 0 }, equips: [ 'ジャギィＳメイル' ] },
                { skills: { '攻撃': 2, '斬れ味': 1 }, equips: [ 'ジャギィＳメイル' ] },
                { skills: { '攻撃': 1, '斬れ味': 2 }, equips: [ 'slot3' ] },
                { skills: { '攻撃': 3, '斬れ味': 1 }, equips: [ 'slot3' ] },
                { skills: { '攻撃': 0, '斬れ味': 4 }, equips: [ 'slot3' ] },
                { skills: { '攻撃': 2, '斬れ味': 2 }, equips: [ 'シルバーソルメイル' ] },
                { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ 'シルバーソルメイル' ] },
                { skills: { '攻撃': 4, '斬れ味': 1 },
                  equips: [ 'バギィＳメイル', 'シルバーソルメイル' ] },
                { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ 'バギィＳメイル' ] },
                { skills: { '攻撃': 5, '斬れ味': 0 }, equips: [ 'slot3' ] },
                { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ 'バギィＳメイル' ] }
            ];
            assert.deepEqual(sorter(got), sorter(exp));
        });

        it('should do normalize4 if contain torsoUp', () => {
            let combs = {
                'ジャギィＳグリーヴ': [
                    { '攻撃': 5, '斬れ味': 0 },
                    { '攻撃': 4, '斬れ味': 1 } ],
                '胴系統倍加': [
                    { '胴系統倍加': 1 } ],
                slot0: [
                    { '攻撃': 0, '斬れ味': 0 } ],
                'シルバーソルグリーヴ': [
                    { '攻撃': 3, '斬れ味': 4 }, { '攻撃': 5, '斬れ味': 3 },
                    { '攻撃': 7, '斬れ味': 2 }, { '攻撃': 2, '斬れ味': 6 } ]
            };
            let got = n._normalize4(combs);
            let exp = [
                { skills: { '攻撃': 0, '斬れ味': 0 }, equips: [ 'slot0' ] },
                { skills: { '胴系統倍加': 1 }, equips: [ '胴系統倍加' ] },
                { skills: { '攻撃': 5, '斬れ味': 0 }, equips: [ 'ジャギィＳグリーヴ' ] },
                { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ 'ジャギィＳグリーヴ' ] },
                { skills: { '攻撃': 3, '斬れ味': 4 }, equips: [ 'シルバーソルグリーヴ' ] },
                { skills: { '攻撃': 5, '斬れ味': 3 }, equips: [ 'シルバーソルグリーヴ' ] },
                { skills: { '攻撃': 2, '斬れ味': 6 }, equips: [ 'シルバーソルグリーヴ' ] },
                { skills: { '攻撃': 7, '斬れ味': 2 }, equips: [ 'シルバーソルグリーヴ' ] }
            ];
            assert.deepEqual(sorter(got), sorter(exp));
        });

        it('should do normalize4 if null or etc', () => {
            assert.deepEqual(n._normalize4(), []);
            assert.deepEqual(n._normalize4(null), []);
            assert.deepEqual(n._normalize4({}), []);
        });
    });
});
