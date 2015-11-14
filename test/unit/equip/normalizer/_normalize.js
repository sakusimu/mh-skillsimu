'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../../lib/equip/normalizer');
const data = require('../../../../lib/data');
const myapp = require('../../../support/lib/driver-myapp');

describe('equip/normalizer/normalize', () => {
    beforeEach(() => { myapp.initialize(); });

    function joinSkillComb(skillComb) {
        let skills = Object.keys(skillComb).sort().map(tree => {
            return tree + ':' + skillComb[tree];
        });
        return skills.join(',');
    }
    function sorter(bulks) {
        return bulks.sort((a, b) => {
            return joinSkillComb(a.skillComb) > joinSkillComb(b.skillComb) ? 1 : -1;
        });
    }

    describe('normalize()', () => {
        let n = new Normalizer();

        it('should normalize', () => {
            data.equips.head = [
                { name: 'ランポスヘルム', slot: 1, skillComb: { '攻撃': 2 } },
                { name: 'バトルヘルム', slot: 2, skillComb: { '攻撃': 2, '研ぎ師': 1 } },
                { name: 'レックスヘルム', slot: 1, skillComb: { '攻撃': 3, '研ぎ師': -2 } },
                { name: 'リオソウルヘルム', slot: 3, skillComb: { '斬れ味': 2, '聴覚保護': 1 } },
                { name: 'シルバーソルヘルム', slot: 1, skillComb: { '斬れ味': 3, '痛撃': 2 } },
                { name: 'slot0', slot: 0, skillComb: {} },
                { name: 'slot1', slot: 1, skillComb: {} },
                { name: 'slot2', slot: 2, skillComb: {} },
                { name: 'slot3', slot: 3, skillComb: {} }
            ];
            n.initialize();

            let bulksSet = n.normalize([ '攻撃力UP【大】', '業物' ]);
            let got = sorter(bulksSet.head);
            let exp = sorter([
                { skillComb: { '攻撃': 0, '斬れ味': 0 }, equips: [ 'slot0' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 1 }, equips: [ 'slot1' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 2 }, equips: [ 'slot2' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 4 },
                  equips: [ 'シルバーソルヘルム', 'slot3' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 6 }, equips: [ 'リオソウルヘルム' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 0 }, equips: [ 'slot1' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 1 }, equips: [ 'slot2' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 2 }, equips: [ 'slot3' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 3 }, equips: [ 'シルバーソルヘルム' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 4 }, equips: [ 'リオソウルヘルム' ] },
                { skillComb: { '攻撃': 2, '斬れ味': 1 }, equips: [ 'ランポスヘルム' ] },
                { skillComb: { '攻撃': 2, '斬れ味': 2 }, equips: [ 'バトルヘルム' ] },
                { skillComb: { '攻撃': 3, '斬れ味': 0 },
                  equips: [ 'ランポスヘルム', 'slot2' ] },
                { skillComb: { '攻撃': 3, '斬れ味': 1 },
                  equips: [ 'バトルヘルム', 'レックスヘルム', 'slot3' ] },
                { skillComb: { '攻撃': 3, '斬れ味': 3 }, equips: [ 'リオソウルヘルム' ] },
                { skillComb: { '攻撃': 4, '斬れ味': 0 }, equips: [ 'レックスヘルム' ] },
                { skillComb: { '攻撃': 5, '斬れ味': 0 },
                  equips: [ 'バトルヘルム', 'slot3' ] },
                { skillComb: { '攻撃': 5, '斬れ味': 2 }, equips: [ 'リオソウルヘルム' ] }
            ]);
            assert.deepEqual(got, exp, 'head');
            got = bulksSet.weapon;
            assert.deepEqual(got, [], 'weapon');
            got = bulksSet.oma;
            assert.deepEqual(got, [], 'oma');
        });

        it('should normalize if contain torsoUp', () => {
            data.equips.leg = [
                { name: 'マギュルヴルツェル', slot: 0, skillComb: { '溜め短縮': 3 } },
                { name: 'クシャナハディ', slot: 2, skillComb: { '溜め短縮': 2 } },
                { name: 'シルバーソルレギンス', slot: 0, skillComb: { '痛撃': 2 } },
                { name: 'ドラゴンレグス', slot: 1, skillComb: { '痛撃': 2 } },
                { name: 'slot0', slot: 0, skillComb: {} },
                { name: 'slot1', slot: 1, skillComb: {} },
                { name: 'slot2', slot: 2, skillComb: {} },
                { name: 'slot3', slot: 3, skillComb: {} },
                { name: 'torsoUp', slot: 0, skillComb: { '胴系統倍加': 1 } }
            ];
            n.initialize();

            let bulksSet = n.normalize([ '集中', '弱点特効' ]);
            let got = sorter(bulksSet.leg);
            let exp = sorter([
                { skillComb: { '溜め短縮': 0, '痛撃': 0 }, equips: [ 'slot0' ] },
                { skillComb: { '溜め短縮': 0, '痛撃': 1 }, equips: [ 'slot1' ] },
                { skillComb: { '溜め短縮': 0, '痛撃': 2 },
                  equips: [ 'シルバーソルレギンス', 'slot2' ] },
                { skillComb: { '溜め短縮': 0, '痛撃': 3 }, equips: [ 'ドラゴンレグス' ] },
                { skillComb: { '溜め短縮': 0, '痛撃': 4 }, equips: [ 'slot3' ] },
                { skillComb: { '溜め短縮': 1, '痛撃': 0 }, equips: [ 'slot1' ] },
                { skillComb: { '溜め短縮': 1, '痛撃': 1 }, equips: [ 'slot2' ] },
                { skillComb: { '溜め短縮': 1, '痛撃': 2 },
                  equips: [ 'ドラゴンレグス', 'slot3' ] },
                { skillComb: { '溜め短縮': 2, '痛撃': 0 }, equips: [ 'slot2' ] },
                { skillComb: { '溜め短縮': 2, '痛撃': 1 }, equips: [ 'slot3' ] },
                { skillComb: { '溜め短縮': 2, '痛撃': 2 }, equips: [ 'クシャナハディ' ] },
                { skillComb: { '溜め短縮': 3, '痛撃': 0 }, equips: [ 'マギュルヴルツェル' ] },
                { skillComb: { '溜め短縮': 3, '痛撃': 1 }, equips: [ 'クシャナハディ' ] },
                { skillComb: { '溜め短縮': 4, '痛撃': 0 },
                  equips: [ 'クシャナハディ', 'slot3' ] },
                { skillComb: { '溜め短縮': 0, '痛撃': 0, '胴系統倍加': 1 },
                  equips: [ 'torsoUp' ] }
            ]);
            assert.deepEqual(got, exp);
        });

        it('should normalize if null or etc', () => {
            assert(n.normalize() === null);
            assert(n.normalize(null) === null);
            assert(n.normalize([]) === null);
        });
    });
});
