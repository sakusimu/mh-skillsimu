'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../../lib/equip/normalizer');
const myapp = require('../../../support/lib/driver-myapp');

describe('equip/normalizer/normalize4', () => {
    beforeEach(() => { myapp.initialize(); });

    describe('_normalize4()', () => {
        let n = new Normalizer();

        function joinSkillComb(skillComb) {
            let skills = Object.keys(skillComb).sort().map(tree => {
                return tree + ':' + skillComb[tree];
            });
            return skills.join(',');
        }
        function sorter(actiCombs) {
            return actiCombs.sort((a, b) => {
                return joinSkillComb(a.skillComb) > joinSkillComb(b.skillComb) ? 1 : -1;
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
                { skillComb: { '攻撃': 0, '斬れ味': 0 }, equips: [ 'slot0' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 2 }, equips: [ 'ジンオウメイル' ] },
                { skillComb: { '攻撃': 3, '斬れ味': 0 }, equips: [ 'ジャギィＳメイル' ] },
                { skillComb: { '攻撃': 2, '斬れ味': 1 }, equips: [ 'ジャギィＳメイル' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 2 }, equips: [ 'slot3' ] },
                { skillComb: { '攻撃': 3, '斬れ味': 1 }, equips: [ 'slot3' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 4 }, equips: [ 'slot3' ] },
                { skillComb: { '攻撃': 2, '斬れ味': 2 }, equips: [ 'シルバーソルメイル' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 3 }, equips: [ 'シルバーソルメイル' ] },
                { skillComb: { '攻撃': 4, '斬れ味': 1 },
                  equips: [ 'バギィＳメイル', 'シルバーソルメイル' ] },
                { skillComb: { '攻撃': 3, '斬れ味': 2 }, equips: [ 'バギィＳメイル' ] },
                { skillComb: { '攻撃': 5, '斬れ味': 0 }, equips: [ 'slot3' ] },
                { skillComb: { '攻撃': 6, '斬れ味': 0 }, equips: [ 'バギィＳメイル' ] }
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
                { skillComb: { '攻撃': 0, '斬れ味': 0 }, equips: [ 'slot0' ] },
                { skillComb: { '胴系統倍加': 1 }, equips: [ '胴系統倍加' ] },
                { skillComb: { '攻撃': 5, '斬れ味': 0 }, equips: [ 'ジャギィＳグリーヴ' ] },
                { skillComb: { '攻撃': 4, '斬れ味': 1 }, equips: [ 'ジャギィＳグリーヴ' ] },
                { skillComb: { '攻撃': 3, '斬れ味': 4 }, equips: [ 'シルバーソルグリーヴ' ] },
                { skillComb: { '攻撃': 5, '斬れ味': 3 }, equips: [ 'シルバーソルグリーヴ' ] },
                { skillComb: { '攻撃': 2, '斬れ味': 6 }, equips: [ 'シルバーソルグリーヴ' ] },
                { skillComb: { '攻撃': 7, '斬れ味': 2 }, equips: [ 'シルバーソルグリーヴ' ] }
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