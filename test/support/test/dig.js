'use strict';
const assert = require('power-assert');
const model = require('../lib/driver-dig');
const Context = require('../lib/driver-context');

describe('test-driver/dig', () => {
    describe('constructor()', () => {
        it('should create dig', () => {
            let dig = new model.Dig([ 0, 1, '刀匠', 4 ]);
            assert(dig);

            assert(dig.name === '発掘(刀匠+4)');
            assert(dig.sex === 0);
            assert(dig.type === 1);
            assert(dig.slot === 0);
            assert(dig.skillTree1 === '刀匠');
            assert(dig.skillPt1 === 4);
        });
    });

    describe('toStirng()', () => {
        it('should return string', () => {
            let dig = new model.Dig([ 0, 1, '刀匠', 4 ]);
            assert(dig.toString() === '発掘(刀匠+4)');
        });
    });

    describe('isEnabled()', () => {
        it('should return true if equip is enabled', () => {
            let ctx = new Context();

            // "性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",スキル系統1,スキル値1
            let digs = [
                [ '0','0','強欲','6' ],
                [ '0','1','刀匠','4' ],
                [ '0','2','射手','4' ]
            ].map(list => new model.Dig(list));

            ctx.initialize({ sex: 'm', type: 'k' });
            let got = digs.map(d => d.isEnabled(ctx));
            let exp = [ true,true,false ];
            assert.deepEqual(got, exp, 'm k');
            ctx.initialize({ sex: 'w', type: 'g' });
            got = digs.map(d => d.isEnabled(ctx));
            exp = [ true,false,true ];
            assert.deepEqual(got, exp, 'w g');
        });
    });

    describe('simuData()', () => {
        it('should return simuData', () => {
            let dig = new model.Dig([ 0, 1, '刀匠', 4 ]);
            let got = dig.simuData();
            let exp = {
                name: '発掘(刀匠+4)',
                slot: 0,
                skillComb: { '刀匠': 4 }
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('digs.data', () => {
        it('should have some properties', () => {
            let got = Object.keys(model.digs.data.weapon).length;
            assert(got === 24);
            got = Object.keys(model.digs.data.head).length;
            assert(got === 36);
        });
    });

    describe('Digs#enabled()', () => {
        it('should return enabled digs', () => {
            let ctx = new Context();

            const gunner = dig => dig.skillTree1 === '射手';

            model.digs.initialize();
            let got = model.digs.enabled('head', ctx).filter(gunner).length;
            assert(got > 0);
            got = model.digs.enabled('body', ctx).filter(gunner).length;
            assert(got === 0);
        });

        it('should throw exception in some case', () => {
            let got;
            try { model.digs.enabled(); } catch (e) { got = e.message; }
            assert(got === 'part is required');

            try { model.digs.enabled('hoge'); } catch (e) { got = e.message; }
            assert(got === 'unknown part: hoge');
        });
    });

    describe('Digs#get()', () => {
        it('should return dig', () => {
            let got = model.digs.get('head', '発掘(刀匠+2)');
            assert(got instanceof model.Dig);
            assert(got.name === '発掘(刀匠+2)');
        });

        it('should return null in some case', () => {
            let got = model.digs.get('head', null);
            assert(got === null);

            got = model.digs.get('head', 'nonexistent');
            assert(got === null);
        });

        it('should throw exception in some case', () => {
            let got;
            try { model.digs.get(); } catch (e) { got = e.message; }
            assert(got === 'part is required');
            try { model.digs.get('hoge'); } catch (e) { got = e.message; }
            assert(got === 'unknown part: hoge');
        });
    });
});
