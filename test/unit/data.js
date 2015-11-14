'use strict';
const assert = require('power-assert');
const data = require('../../lib/data');

describe('data', () => {
    describe('export', () => {
        it('should export data', () => {
            assert(typeof data === 'object', 'is object');
        });

        it('should have some properties', () => {
            data.initialize();

            let got = data.equips;
            let exp = { head: [], body: [], arm: [], waist:[], leg:[], weapon: [], oma: [] };
            assert.deepEqual(got, exp);
            got = data.decos;
            assert.deepEqual(got, []);
            got = data.skills;
            assert.deepEqual(got, {});
        });
    });

    describe('set()', () => {
        it('should set', () => {
            data.set({
                equips: {
                    head : [ 'head01', 'head02' ],
                    body : [ 'body01', 'body02' ],
                    arm  : [ 'arm01', 'arm02' ],
                    waist: [ 'waist01', 'waist02' ],
                    leg  : [ 'leg01', 'leg02' ],
                    //weapon: undefined
                    oma  : [ 'oma01', 'oma02' ]
                },
                decos: [ 'deco01', 'deco02' ],
                skills: { 'skill01': 'skill01', 'skill02': 'skill02' }
            });
            let got = data.equips;
            let exp = {
                head  : [ 'head01', 'head02' ],
                body  : [ 'body01', 'body02' ],
                arm   : [ 'arm01', 'arm02' ],
                waist : [ 'waist01', 'waist02' ],
                leg   : [ 'leg01', 'leg02' ],
                weapon: [],
                oma   : [ 'oma01', 'oma02' ]
            };
            assert.deepEqual(got, exp);
            got = data.decos;
            exp = [ 'deco01', 'deco02' ];
            assert.deepEqual(got, exp);
            got = data.skills;
            exp = { 'skill01': 'skill01', 'skill02': 'skill02' };
            assert.deepEqual(got, exp);
        });

        it('regression test: not update only equips.body', () => {
            // equips.body だけの更新はされない(以前はされた)
            data.set({
                equips: {
                    body : [ 'body11', 'body12' ]
                }
            });
            let got = data.equips;
            let exp = {
                head  : [],
                body  : [ 'body11', 'body12' ],
                arm   : [],
                waist : [],
                leg   : [],
                weapon: [],
                oma   : []
            };
            assert.deepEqual(got, exp);
            got = data.decos;
            assert.deepEqual(got, []);
            got = data.skills;
            assert.deepEqual(got, {});
        });

        it('regression test: not update only decos', () => {
            // decos だけの更新はされない(以前はされた)
            data.set({ decos: [ 'deco11', 'deco12' ] });
            let got = data.equips;
            let exp = {
                head  : [],
                body  : [],
                arm   : [],
                waist : [],
                leg   : [],
                weapon: [],
                oma   : []
            };
            assert.deepEqual(got, exp);
            got = data.decos;
            exp = [ 'deco11', 'deco12' ];
            assert.deepEqual(got, exp);
            got = data.skills;
            assert.deepEqual(got, {});
        });
    });
});
