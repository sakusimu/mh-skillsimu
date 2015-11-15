'use strict';
const assert = require('power-assert');
const Normalizer = require('../../lib/equip/normalizer');
const data = require('../../lib/data');
const myapp = require('../support/lib/driver-myapp');

describe('mh4g/equip-normalizer', () => {
    beforeEach(() => { myapp.initialize(); });

    function summary(bulks) {
        let ret = {};
        Object.keys(bulks).forEach(part => ret[part] = bulks[part].length);
        return ret;
    }

    describe('normalize: selected equips', () => {
        let n = new Normalizer();

        it('should normalize if contain a fixed equip', () => {
            // スキルポイントがマイナスの装備で固定
            data.equips.body = [
                myapp.equip('body', 'アカムトウルンテ') // 斬れ味-2, スロ1
            ];
            n.initialize();

            let bulksSet = n.normalize([ '攻撃力UP【大】', '業物' ]);
            let got = bulksSet.body;
            let exp = [
                { skillComb: { '攻撃': 1, '斬れ味': -2 }, equips: [ 'アカムトウルンテ' ] },
                { skillComb: { '攻撃': 0, '斬れ味': -1 }, equips: [ 'アカムトウルンテ' ] }
            ];
            assert.deepEqual(got, exp, 'body');
            got = summary(bulksSet);
            exp = { head: 37, body: 2, arm: 29, waist: 30, leg: 36, weapon: 0, oma: 0 };
            assert.deepEqual(got, exp, 'summary');
        });

        it('should normalize if contain selected equips', () => {
            // スキルポイントがマイナスの装備が複数
            data.equips.body = [
                myapp.equip('body', 'ブナハＳスーツ'),   // 攻撃-2, スロ0
                myapp.equip('body', 'リベリオンメイル'), // 攻撃-4, スロ1
                myapp.equip('body', 'アカムトウルンテ')  // 斬れ味-2, スロ1
            ];
            n.initialize();

            let bulksSet = n.normalize([ '攻撃力UP【大】', '業物' ]);
            let got = summary(bulksSet);
            let exp = { head: 37, body: 5, arm: 29, waist: 30, leg: 36, weapon: 0, oma: 0 };
            assert.deepEqual(got, exp);
        });
    });

    describe('normalize: weapon slot', () => {
        let n = new Normalizer();

        it('should normalize if contain a slot0 weapon', () => {
            myapp.setup({ weaponSlot: 0 });
            n.initialize();

            let bulksSet = n.normalize([ '攻撃力UP【大】', '業物' ]);
            let got = bulksSet.weapon;
            let exp = [
                { skillComb: { '攻撃': 0, '斬れ味': 0 }, equips: [ 'slot0' ] }
            ];
            assert.deepEqual(got, exp);
        });

        it('should normalize if contain a slot3 weapon', () => {
            myapp.setup({ weaponSlot: 3 });
            n.initialize();

            let bulksSet = n.normalize([ '攻撃力UP【大】', '業物' ]);
            let got = bulksSet.weapon;
            let exp = [
                { skillComb: { '攻撃': 1, '斬れ味': 2 }, equips: [ 'slot3' ] },
                { skillComb: { '攻撃': 3, '斬れ味': 1 }, equips: [ 'slot3' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 4 }, equips: [ 'slot3' ] },
                { skillComb: { '攻撃': 5, '斬れ味': 0 }, equips: [ 'slot3' ] }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('normalize: oma', () => {
        let n = new Normalizer();

        it('should normalize if contain omas', () => {
            myapp.setup({
                hunter: { hr: 1, vs: 6 },
                omas: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ]
            });
            n.initialize();

            let bulksSet = n.normalize([ '斬れ味レベル+1', '攻撃力UP【中】', '耳栓' ]);
            let got = bulksSet.oma;
            let exp = [
                { skillComb: { '匠': 0, '攻撃': 0, '聴覚保護': 3 },
                  equips: [ '龍の護石(スロ3,痛撃+4)' ] },
                { skillComb: { '匠': 0, '攻撃': 1, '聴覚保護': 2 },
                  equips: [ '龍の護石(スロ3,痛撃+4)' ] },
                { skillComb: { '匠': 0, '攻撃': 3, '聴覚保護': 1 },
                  equips: [ '龍の護石(スロ3,痛撃+4)' ] },
                { skillComb: { '匠': 0, '攻撃': 4, '聴覚保護': 0 },
                  equips: [ '龍の護石(スロ3,痛撃+4)' ] },
                { skillComb: { '匠': 4, '攻撃': 0, '聴覚保護': 3 },
                  equips: [ '龍の護石(スロ3,匠+4,氷耐性-5)' ] },
                { skillComb: { '匠': 4, '攻撃': 1, '聴覚保護': 2 },
                  equips: [ '龍の護石(スロ3,匠+4,氷耐性-5)' ] },
                { skillComb: { '匠': 4, '攻撃': 3, '聴覚保護': 1 },
                  equips: [ '龍の護石(スロ3,匠+4,氷耐性-5)' ] },
                { skillComb: { '匠': 4, '攻撃': 4, '聴覚保護': 0 },
                  equips: [ '龍の護石(スロ3,匠+4,氷耐性-5)' ] },
                { skillComb: { '匠': 0, '攻撃': 9, '聴覚保護': 0 },
                  equips: [ '龍の護石(スロ0,溜め短縮+5,攻撃+9)' ] }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('normalize: dig', () => {
        let n = new Normalizer();

        it('should normalize if contain dig equips', () => {
            myapp.setup({
                omas: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ],
                dig: true
            });
            n.initialize();

            let bulksSet = n.normalize([ '真打', '集中', '弱点特効', '耳栓' ]);
            let got = bulksSet.weapon;
            let exp = [
                { skillComb: { '刀匠': 0, '溜め短縮': 0, '痛撃': 0, '聴覚保護': 0 },
                  equips: [
                      '発掘(状耐+2)','発掘(状耐+3)','発掘(状耐+4)',
                      '発掘(回避+3)','発掘(回避+4)','発掘(回避+5)',
                      '発掘(強欲+3)','発掘(強欲+4)','発掘(強欲+6)',
                      '発掘(護収+3)','発掘(護収+4)','発掘(護収+6)' ] },
                { skillComb: { '刀匠': 2, '溜め短縮': 0, '痛撃': 0, '聴覚保護': 0 },
                  equips: [ '発掘(刀匠+2)' ] },
                { skillComb: { '刀匠': 3, '溜め短縮': 0, '痛撃': 0, '聴覚保護': 0 },
                  equips: [ '発掘(刀匠+3)' ] },
                { skillComb: { '刀匠': 4, '溜め短縮': 0, '痛撃': 0, '聴覚保護': 0 },
                  equips: [ '発掘(刀匠+4)' ] }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('normalize: summary', () => {
        let n = new Normalizer();

        it('[ "攻撃力UP【大】", "業物" ]', () => {
            let bulksSet = n.normalize([ '攻撃力UP【大】', '業物' ]);
            let got = summary(bulksSet);
            let exp = { head: 37, body: 29, arm: 29, waist: 30, leg: 36, weapon: 0, oma: 0 };
            assert.deepEqual(got, exp);
        });

        it('[ "斬れ味レベル+1", "高級耳栓" ]', () => {
            let bulksSet = n.normalize([ '斬れ味レベル+1', '高級耳栓' ]);
            let got = summary(bulksSet);
            let exp = { head: 19, body: 16, arm: 21, waist: 21, leg: 24, weapon: 0, oma: 0 };
            assert.deepEqual(got, exp);
        });

        it('[ "斬れ味レベル+1", "耳栓" ]', () => {
            // スキル系統で見ているので、高級耳栓も耳栓も結果は同じ
            let bulksSet = n.normalize([ '斬れ味レベル+1', '耳栓' ]);
            let got = summary(bulksSet);
            let exp = { head: 19, body: 16, arm: 21, waist: 21, leg: 24, weapon: 0, oma: 0 };
            assert.deepEqual(got, exp);
        });

        it('[ "攻撃力UP【大】", "業物", "集中", "見切り+1", "弱点特効" ]', () => {
            let skills = [ '攻撃力UP【大】', '業物', '集中', '見切り+1', '弱点特効' ];
            let bulksSet = n.normalize(skills);
            let got = summary(bulksSet);
            let exp = { head: 444, body: 229, arm: 250, waist: 343, leg: 282, weapon: 0, oma: 0 };
            assert.deepEqual(got, exp);
        });
    });
});
