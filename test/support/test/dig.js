'use strict';
const assert = require('power-assert');
const model = require('../lib/driver-dig');
const Hunter = require('../lib/driver-hunter');

describe('test-driver/dig', () => {
    describe('Dig#constructor()', () => {
        it('should create dig', () => {
            let data = [ 0, 1, '刀匠', 4 ];

            let dig = new model.Dig(data);
            assert(dig);

            let got = {};
            model.Dig.props.forEach(prop => got[prop] = dig[prop]);
            let exp = {
                name: '発掘(刀匠+4)', sex: 0, type: 1, slot: 0,
                skillTree1: '刀匠', skillPt1: 4
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create equip if no arguments', () => {
            let dig = new model.Dig();
            assert(dig);

            let got = {};
            model.Dig.props.forEach(prop => got[prop] = dig[prop]);
            let exp = {
                name: '発掘(null+0)', sex: 0, type: 0, slot: 0,
                skillTree1: null, skillPt1: 0
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Dig#isEnabled()', () => {
        it('should return true if equip is enabled', () => {
            let hunter = new Hunter();

            // "性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",スキル系統1,スキル値1
            let digs = [
                [ '0','0','強欲','6' ],
                [ '0','1','刀匠','4' ],
                [ '0','2','射手','4' ]
            ].map(data => new model.Dig(data));

            hunter.init({ sex: 'm', type: 'k' });
            let got = digs.map(d => d.isEnabled(hunter));
            let exp = [ true,true,false ];
            assert.deepEqual(got, exp, 'm k');
            hunter.init({ sex: 'w', type: 'g' });
            got = digs.map(d => d.isEnabled(hunter));
            exp = [ true,false,true ];
            assert.deepEqual(got, exp, 'w g');
        });
    });

    describe('Dig#simuData()', () => {
        it('should return simuData', () => {
            let dig = new model.Dig([ 0, 1, '刀匠', 4 ]);
            let got = dig.simuData();
            let exp = {
                name: '発掘(刀匠+4)',
                slot: 0,
                skillComb: { '刀匠': 4 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Digs#enabled()', () => {
        let hunter = new Hunter();

        it('should return enabled digs', () => {
            let digs = new model.Digs({
                body: [
                    [ 0, 1, '刀匠', 2 ],
                    [ 0, 1, '刀匠', 3 ],
                    [ 0, 2, '射手', 2 ],
                    [ 0, 2, '射手', 3 ]
                ]
            });

            let list = digs.enabled('body', hunter);
            let got = list.map(dig => dig.name);
            let exp = [
                '発掘(刀匠+2)',
                '発掘(刀匠+3)'
            ];
            assert.deepEqual(got, exp);
        });

        it('should return [] if digs is empty', () => {
            let digs = new model.Digs();
            let got = digs.enabled('body', hunter);
            assert.deepEqual(got, []);
        });

        it('should throw exception if no arguments', () => {
            let digs = new model.Digs();
            let got;
            try { digs.enabled(); } catch (e) { got = e.message; }
            assert(got === 'part is required');
        });
    });

    describe('Digs#get()', () => {
        let digs = new model.Digs({
            body: [
                [ 0, 1, '刀匠', 2 ],
                [ 0, 1, '刀匠', 3 ],
                [ 0, 2, '射手', 2 ],
                [ 0, 2, '射手', 3 ]
            ]
        });

        it('should return dig', () => {
            let dig = digs.get('body', '発掘(刀匠+2)');
            assert(dig);
            assert(dig.name === '発掘(刀匠+2)');
        });

        it('should return null in some case', () => {
            let got = digs.get('body');
            assert(got === null);
            got = digs.get('body', null);
            assert(got === null);
            got = digs.get('body', 'nonexistent');
            assert(got === null);

            got = digs.get('head');
            assert(got === null);
            got = digs.get('head', 'nonexistent');
            assert(got === null);
        });

        it('should throw exception if no arguments', () => {
            let got;
            try { digs.get(); } catch (e) { got = e.message; }
            assert(got === 'part is required');
        });
    });
});
