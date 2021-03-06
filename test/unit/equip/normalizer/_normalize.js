'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../../lib/equip/normalizer');
const Context = require('../../../../lib/context');

describe('equip/normalizer/_normalize', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '集中': { name: '集中', tree: '溜め短縮', point: 10 },
        '弱点特効': { name: '弱点特効', tree: '痛撃', point: 10 },
        '業物': { name: '業物', tree: '斬れ味', point: 10 }
    };
    const DECOS = [
        { name: '攻撃珠【１】', slot: 1, skills: { '攻撃': 1, '防御': -1 } },
        { name: '攻撃珠【２】', slot: 2, skills: { '攻撃': 3, '防御': -1 } },
        { name: '攻撃珠【３】', slot: 3, skills: { '攻撃': 5, '防御': -1 } },
        { name: '痛撃珠【１】', slot: 1, skills: { '痛撃': 1, '体力': -1 } },
        { name: '痛撃珠【３】', slot: 3, skills: { '痛撃': 4, '体力': -2 } },
        { name: '短縮珠【１】', slot: 1, skills: { '溜め短縮': 1, '体術': -1 } },
        { name: '短縮珠【３】', slot: 3, skills: { '溜め短縮': 4, '体術': -2 } },
        { name: '斬鉄珠【１】', slot: 1, skills: { '斬れ味': 1, '匠': -1 } },
        { name: '斬鉄珠【３】', slot: 3, skills: { '斬れ味': 4, '匠': -2 } }
    ];
    let context = new Context();

    beforeEach(() => { context.init({ decos: DECOS, skills: SKILLS }); });

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

    describe('normalize()', () => {
        let n = new Normalizer(context);

        it('should normalize', () => {
            context.equips.head = [
                { name: 'ランポスヘルム', slot: 1, skills: { '攻撃': 2 } },
                { name: 'バトルヘルム', slot: 2, skills: { '攻撃': 2, '研ぎ師': 1 } },
                { name: 'レックスヘルム', slot: 1, skills: { '攻撃': 3, '研ぎ師': -2 } },
                { name: 'リオソウルヘルム', slot: 3, skills: { '斬れ味': 2, '聴覚保護': 1 } },
                { name: 'シルバーソルヘルム', slot: 1, skills: { '斬れ味': 3, '痛撃': 2 } },
                { name: 'slot0', slot: 0, skills: {} },
                { name: 'slot1', slot: 1, skills: {} },
                { name: 'slot2', slot: 2, skills: {} },
                { name: 'slot3', slot: 3, skills: {} }
            ];

            let bulksSet = n.normalize([ '攻撃力UP【大】', '業物' ]);
            let got = sorter(bulksSet.head);
            let exp = sorter([
                { skills: { '攻撃': 0, '斬れ味': 0 }, equips: [ 'slot0' ] },
                { skills: { '攻撃': 0, '斬れ味': 1 }, equips: [ 'slot1' ] },
                { skills: { '攻撃': 0, '斬れ味': 2 }, equips: [ 'slot2' ] },
                { skills: { '攻撃': 0, '斬れ味': 4 },
                  equips: [ 'シルバーソルヘルム', 'slot3' ] },
                { skills: { '攻撃': 0, '斬れ味': 6 }, equips: [ 'リオソウルヘルム' ] },
                { skills: { '攻撃': 1, '斬れ味': 0 }, equips: [ 'slot1' ] },
                { skills: { '攻撃': 1, '斬れ味': 1 }, equips: [ 'slot2' ] },
                { skills: { '攻撃': 1, '斬れ味': 2 }, equips: [ 'slot3' ] },
                { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ 'シルバーソルヘルム' ] },
                { skills: { '攻撃': 1, '斬れ味': 4 }, equips: [ 'リオソウルヘルム' ] },
                { skills: { '攻撃': 2, '斬れ味': 1 }, equips: [ 'ランポスヘルム' ] },
                { skills: { '攻撃': 2, '斬れ味': 2 }, equips: [ 'バトルヘルム' ] },
                { skills: { '攻撃': 3, '斬れ味': 0 },
                  equips: [ 'ランポスヘルム', 'slot2' ] },
                { skills: { '攻撃': 3, '斬れ味': 1 },
                  equips: [ 'バトルヘルム', 'レックスヘルム', 'slot3' ] },
                { skills: { '攻撃': 3, '斬れ味': 3 }, equips: [ 'リオソウルヘルム' ] },
                { skills: { '攻撃': 4, '斬れ味': 0 }, equips: [ 'レックスヘルム' ] },
                { skills: { '攻撃': 5, '斬れ味': 0 },
                  equips: [ 'バトルヘルム', 'slot3' ] },
                { skills: { '攻撃': 5, '斬れ味': 2 }, equips: [ 'リオソウルヘルム' ] }
            ]);
            assert.deepEqual(got, exp, 'head');
            got = bulksSet.weapon;
            assert.deepEqual(got, [], 'weapon');
            got = bulksSet.charm;
            assert.deepEqual(got, [], 'charm');
        });

        it('should normalize if contain torsoUp', () => {
            context.equips.leg = [
                { name: 'マギュルヴルツェル', slot: 0, skills: { '溜め短縮': 3 } },
                { name: 'クシャナハディ', slot: 2, skills: { '溜め短縮': 2 } },
                { name: 'シルバーソルレギンス', slot: 0, skills: { '痛撃': 2 } },
                { name: 'ドラゴンレグス', slot: 1, skills: { '痛撃': 2 } },
                { name: 'slot0', slot: 0, skills: {} },
                { name: 'slot1', slot: 1, skills: {} },
                { name: 'slot2', slot: 2, skills: {} },
                { name: 'slot3', slot: 3, skills: {} },
                { name: 'torsoUp', slot: 0, skills: { '胴系統倍加': 1 } }
            ];

            let bulksSet = n.normalize([ '集中', '弱点特効' ]);
            let got = sorter(bulksSet.leg);
            let exp = sorter([
                { skills: { '溜め短縮': 0, '痛撃': 0 }, equips: [ 'slot0' ] },
                { skills: { '溜め短縮': 0, '痛撃': 1 }, equips: [ 'slot1' ] },
                { skills: { '溜め短縮': 0, '痛撃': 2 },
                  equips: [ 'シルバーソルレギンス', 'slot2' ] },
                { skills: { '溜め短縮': 0, '痛撃': 3 }, equips: [ 'ドラゴンレグス' ] },
                { skills: { '溜め短縮': 0, '痛撃': 4 }, equips: [ 'slot3' ] },
                { skills: { '溜め短縮': 1, '痛撃': 0 }, equips: [ 'slot1' ] },
                { skills: { '溜め短縮': 1, '痛撃': 1 }, equips: [ 'slot2' ] },
                { skills: { '溜め短縮': 1, '痛撃': 2 },
                  equips: [ 'ドラゴンレグス', 'slot3' ] },
                { skills: { '溜め短縮': 2, '痛撃': 0 }, equips: [ 'slot2' ] },
                { skills: { '溜め短縮': 2, '痛撃': 1 }, equips: [ 'slot3' ] },
                { skills: { '溜め短縮': 2, '痛撃': 2 }, equips: [ 'クシャナハディ' ] },
                { skills: { '溜め短縮': 3, '痛撃': 0 }, equips: [ 'マギュルヴルツェル' ] },
                { skills: { '溜め短縮': 3, '痛撃': 1 }, equips: [ 'クシャナハディ' ] },
                { skills: { '溜め短縮': 4, '痛撃': 0 },
                  equips: [ 'クシャナハディ', 'slot3' ] },
                { skills: { '溜め短縮': 0, '痛撃': 0, '胴系統倍加': 1 },
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
