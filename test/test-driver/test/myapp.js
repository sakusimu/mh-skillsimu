'use strict';
const assert = require('power-assert');
const createMyApp = require('../myapp');
const MyApp = createMyApp.MyApp;

describe('test-driver/myapp', () => {
    describe('export', () => {
        it('should export function', () => {
            assert(typeof createMyApp === 'function');
        });
    });

    describe('constructor()', () => {
        it('should create myapp', () => {
            let myapp = new MyApp('mh4g');
            assert(myapp);
        });

        it('should throw exception if no arguments', () => {
            let got;
            try { new MyApp(); } catch (e) { got = e.message; }
            assert(got === 'series is require');
        });
    });

    describe('setup()', () => {
        let myapp = createMyApp('mh4g');

        it('should setup', () => {
            myapp.setup();
            assert(myapp.data.equips.head.length > 0);
            assert(myapp.data.decos.length > 0);
            let got = Object.keys(myapp.data.skills).length;
            assert(got > 0);

            myapp.setup({
                weaponSlot: 2,
                omas: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ]
                ]
            });
            got = myapp.data.equips.weapon;
            let exp = [
                { name: 'slot2', slot: 2, skillComb: {} }
            ];
            assert.deepEqual(got, exp);
            got = myapp.data.equips.oma;
            exp = [
                { name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                  skillComb: { '匠': 4, '氷耐性': -5 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should setup dig', () => {
            const tousyo = eq => /発掘\(刀匠/.test(eq.name);

            myapp.setup({ dig: true });
            let got = myapp.data.equips.head.filter(tousyo).map(eq => eq.name);
            let exp = [ '発掘(刀匠+2)', '発掘(刀匠+3)' ];
            assert.deepEqual(got, exp);
            got = myapp.data.equips.weapon.filter(tousyo).map(eq => eq.name);
            exp = [ '発掘(刀匠+2)', '発掘(刀匠+3)', '発掘(刀匠+4)' ];
            assert.deepEqual(got, exp);
        });
    });

    describe('MyApp#equip()', () => {
        it('should return equip', () => {
            let got = MyApp.equip(['レウスヘルム',0,0,3,0,3,5,23,125,2,0,-2,0,-3,'攻撃',3,'火属性攻撃',1,'回復量',-2,null,null,null,null,'火竜の鱗',3,'火竜の甲殻',3,'火竜の翼爪',1,'ドラグ ライト鉱石',3]);
            let exp = {
                name: 'レウスヘルム', slot: 0,
                skillComb: { '回復量': -2, '攻撃': 3, '火属性攻撃': 1 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('MyApp#oma()', () => {
        it('should return oma', () => {
            let got = MyApp.oma([ '龍の護石',3,'匠',4,'氷耐性',-5 ]);
            let exp = {
                name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                skillComb: { '匠': 4, '氷耐性': -5 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});