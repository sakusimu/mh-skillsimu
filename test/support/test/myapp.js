'use strict';
const assert = require('power-assert');
const myapp = require('../lib/driver-myapp');
const data = require('../../../lib/data');

describe('test-driver/myapp', () => {
    describe('export', () => {
        it('should export myapp', () => {
            assert(myapp);
            assert(myapp.hunter);
        });
    });

    describe('setup()', () => {
        it('should setup', () => {
            myapp.setup();
            assert(data.equips.head.length > 0);
            assert(data.decos.length > 0);
            let got = Object.keys(data.skills).length;
            assert(got > 0);

            myapp.setup({
                weaponSlot: 2,
                omas: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ]
                ]
            });
            got = data.equips.weapon;
            let exp = [
                { name: 'slot2', slot: 2, skillComb: {} }
            ];
            assert.deepEqual(got, exp);
            got = data.equips.oma;
            exp = [
                { name: '龍の護石(スロ3,匠+4,氷耐性-5)',
                  slot: 3, skillComb: { '匠': 4, '氷耐性': -5 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should setup dig', () => {
            const tousyo = eq => /発掘\(刀匠/.test(eq.name);

            myapp.setup({ dig: true });
            let got = data.equips.head.filter(tousyo).map(eq => eq.name);
            let exp = [ '発掘(刀匠+2)', '発掘(刀匠+3)' ];
            assert.deepEqual(got, exp);
            got = data.equips.weapon.filter(tousyo).map(eq => eq.name);
            exp = [ '発掘(刀匠+2)', '発掘(刀匠+3)', '発掘(刀匠+4)' ];
            assert.deepEqual(got, exp);
        });
    });

    describe('equip()', () => {
        it('should return equip', () => {
            let got = myapp.equip('body', 'ブレイブベスト').name;
            assert(got === 'ブレイブベスト', 'name,0,0');
            got = myapp.equip('body', 'ハンターメイル').name;
            assert(got === 'ハンターメイル', 'name,0,1');
        });

        it('should return equip if not found', () => {
            let got = myapp.equip('body', 'ユクモ');
            assert(got === null);
        });
    });

    describe('oma()', () => {
        it('should return oma', () => {
            let got = myapp.oma([ '龍の護石',3,'匠',4,'氷耐性',-5 ]).name;
            assert(got === '龍の護石(スロ3,匠+4,氷耐性-5)');
        });
    });
});
