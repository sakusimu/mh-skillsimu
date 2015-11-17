'use strict';
const assert = require('power-assert');
const simudata = require('../simudata');
const Hunter = require('../hunter');

describe('test-driver/simudata', () => {
    describe('equips()', () => {
        let hunter = new Hunter();

        it('should return simudata', () => {
            let rawdata = [
                ['レウスヘルム',0,0,3,0,3,5,23,125,2,0,-2,0,-3,'攻撃',3,'火属性攻撃',1,'回復量',-2,null,null,null,null,'火竜の鱗',3,'火竜の甲殻',3,'火竜の翼爪',1,'ドラグライト鉱石',3]
            ];
            let got = simudata.equips(rawdata, hunter);
            let exp = [
                { name: 'レウスヘルム', slot: 0,
                  skillComb: { '回復量': -2, '攻撃': 3, '火属性攻撃': 1 } }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return enabled equips', () => {
            let rawdata = [
                [ '両/両/r/s/HR3/★6',0,0,4,0,3,6 ],
                [ '両/剣/r/s/HR3/★6',0,1,4,0,3,6 ],
                [ '両/ガ/r/s/HR3/★6',0,2,4,0,3,6 ],

                [ '男/両/r/s/HR3/★6',1,0,4,0,3,6 ],
                [ '男/剣/r/s/HR3/★6',1,1,4,0,3,6 ],
                [ '男/ガ/r/s/HR3/★6',1,2,4,0,3,6 ],

                [ '女/両/r/s/HR3/★6',2,0,4,0,3,6 ],
                [ '女/剣/r/s/HR3/★6',2,1,4,0,3,6 ],
                [ '女/ガ/r/s/HR3/★6',2,2,4,0,3,6 ]
            ];

            let equips = simudata.equips(rawdata, hunter);
            let got = equips.map(eq => eq.name);
            let exp = [
                '両/両/r/s/HR3/★6',
                '両/剣/r/s/HR3/★6',
                '男/両/r/s/HR3/★6',
                '男/剣/r/s/HR3/★6'
            ];
            assert.deepEqual(got, exp);
        });

        it('should return [] if rawdata is null', () => {
            let got = simudata.equips(null, hunter);
            assert.deepEqual(got, []);
        });

        it('should throw exception if not specify hunter', () => {
            let got;
            try { simudata.equips([]); } catch (e) { got = e.message; }
        });
    });

    describe('decos()', () => {
        let hunter = new Hunter({ hr: 1, vs: 6 });

        it('should return simudata', () => {
            let rawdata = [
                ['攻撃珠【１】',4,1,2,2,'攻撃',1,'防御',-1,'水光原珠',1,'ジャギィの鱗',2,'怪力の種',1,null,null,null,null,null,null,null,null,null,null]
            ];
            let got = simudata.decos(rawdata, hunter);
            let exp = [
                { name: '攻撃珠【１】', slot: 1,
                  skillComb: { '攻撃': 1, '防御': -1 } }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return enabled decos', () => {
            let rawdata = [
                [ '攻撃珠【１】', 4, 1, 1, 2 ],
                [ '攻撃珠【２】', 6, 2, 2, 4 ],
                [ '攻撃珠【３】', 4, 3, 5, 99 ]
            ];

            let decos = simudata.decos(rawdata, hunter);
            let got = decos.map(d => d.name);
            let exp = [ '攻撃珠【１】', '攻撃珠【２】' ];
            assert.deepEqual(got, exp);
        });

        it('should return [] if rawdata is null', () => {
            let got = simudata.decos(null, hunter);
            assert.deepEqual(got, []);
        });

        it('should throw exception if not specify hunter', () => {
            let got;
            try { simudata.decos([]); } catch (e) { got = e.message; }
        });
    });

    describe('skills()', () => {
        it('should return simudata', () => {
            let rawdata = [ ['攻撃力UP【小】','攻撃',10,0] ];
            let got = simudata.skills(rawdata);
            let exp = {
                '攻撃力UP【小】': { name: '攻撃力UP【小】', tree: '攻撃', point: 10 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return skills', () => {
            let rawdata = [
                [ '攻撃力UP【小】', '攻撃', 10, 0 ],
                [ '攻撃力UP【中】', '攻撃', 15, 0 ],
                [ '攻撃力UP【大】', '攻撃', 20, 0 ]
            ];

            let skills = simudata.skills(rawdata);
            let got = Object.keys(skills).sort();
            let exp = [ '攻撃力UP【小】', '攻撃力UP【中】', '攻撃力UP【大】' ].sort();
            assert.deepEqual(got, exp);
        });

        it('should return {} if rawdata is null', () => {
            let got = simudata.skills(null);
            assert.deepEqual(got, {});
        });
    });

    describe('digs()', () => {
        let hunter = new Hunter();

        it('should return simudata', () => {
            let rawdata = [ [ 0, 1, '刀匠', 2 ] ];
            let got = simudata.digs(rawdata, hunter);
            let exp = [
                { name: '発掘(刀匠+2)', slot: 0, skillComb: { '刀匠': 2 } }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return enabled digs', () => {
            let rawdata = [
                [ 0, 1, '刀匠', 2 ],
                [ 0, 1, '刀匠', 3 ],
                [ 0, 2, '射手', 2 ],
                [ 0, 2, '射手', 3 ]
            ];

            let digs = simudata.digs(rawdata, hunter);
            let got = digs.map(dig => dig.name);
            let exp = [
                '発掘(刀匠+2)',
                '発掘(刀匠+3)'
            ];
            assert.deepEqual(got, exp);
        });

        it('should return [] if rawdata is null', () => {
            let got = simudata.digs(null, hunter);
            assert.deepEqual(got, []);
        });

        it('should throw exception if not specify hunter', () => {
            let got;
            try { simudata.digs([]); } catch (e) { got = e.message; }
        });
    });
});
