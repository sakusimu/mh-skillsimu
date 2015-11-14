'use strict';
const assert = require('power-assert');
const Assembler = require('../../../lib/equip/assembler');

describe('equip/assembler', () => {
    describe('constructor()', () => {
        let a = new Assembler();
        assert(a);
    });

    describe('_assemble()', () => {
        let a = new Assembler();

        it('should assemble', () => {
            let eqcomb = {
                head  : [ 'head01' ],
                body  : [ 'body01' ],
                arm   : [ 'arm01' ],
                waist : [ 'waist01' ],
                leg   : [ 'leg01' ],
                weapon: [ 'wpn01' ],
                oma   : [ 'oma01' ]
            };
            let got = a._assemble(eqcomb);
            let exp = [
                [ 'head01', 'body01', 'arm01', 'waist01', 'leg01', 'wpn01', 'oma01' ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should assemble if weapon and oma are []', () => {
            let eqcomb = {
                head  : [ 'head01' ],
                body  : [ 'body01' ],
                arm   : [ 'arm01' ],
                waist : [ 'waist01' ],
                leg   : [ 'leg01' ],
                weapon: [],
                oma   : []
            };
            let got = a._assemble(eqcomb);
            let exp = [
                [ 'head01', 'body01', 'arm01', 'waist01', 'leg01', null, null ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should assemble if multi equips', () => {
            // equips が複数ある場合に展開されるか
            let eqcomb = {
                head  : [ 'head01', 'head02' ],
                body  : [ 'body01' ],
                arm   : [ 'arm01', 'arm02' ],
                waist : [ 'waist01' ],
                leg   : [ 'leg01', 'leg02' ],
                weapon: [],
                oma   : []
            };
            let got = a._assemble(eqcomb);
            let exp = [
                [ 'head01', 'body01', 'arm01', 'waist01', 'leg01', null, null ],
                [ 'head01', 'body01', 'arm01', 'waist01', 'leg02', null, null ],
                [ 'head01', 'body01', 'arm02', 'waist01', 'leg01', null, null ],
                [ 'head01', 'body01', 'arm02', 'waist01', 'leg02', null, null ],
                [ 'head02', 'body01', 'arm01', 'waist01', 'leg01', null, null ],
                [ 'head02', 'body01', 'arm01', 'waist01', 'leg02', null, null ],
                [ 'head02', 'body01', 'arm02', 'waist01', 'leg01', null, null ],
                [ 'head02', 'body01', 'arm02', 'waist01', 'leg02', null, null ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should assemble using cache', () => {
            let cache = {};

            let eqcomb = {
                head  : [ 'head01' ],
                body  : [ 'body01' ],
                arm   : [ 'arm01' ],
                waist : [ 'waist01' ],
                leg   : [ 'leg01' ],
                weapon: [],
                oma   : [ 'oma01' ]
            };
            a._assemble(eqcomb, cache);

            eqcomb = {
                head  : [ 'head01', 'head02' ],
                body  : [ 'body01' ],
                arm   : [ 'arm01' ],
                waist : [ 'waist01' ],
                leg   : [ 'leg01' ],
                weapon: [],
                oma   : [ 'oma01' ]
            };
            let got = a._assemble(eqcomb, cache);
            let exp = [
                // head01 の組み合わせは既にキャッシュされているので出てこない
                [ 'head02', 'body01', 'arm01', 'waist01', 'leg01', null, 'oma01' ]
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('assemble()', () => {
        let a = new Assembler();

        it('should assemble', () => {
            let eqcombs = [
                { head  : [ 'head1a', 'head1b' ],
                  body  : [ 'body1' ],
                  arm   : [ 'arm1' ],
                  waist : [ 'waist1' ],
                  leg   : [ 'leg1' ],
                  weapon: [ 'weapon1' ],
                  oma   : [ 'oma1' ] },
                { head  : [ 'head2' ],
                  body  : [ 'body2' ],
                  arm   : [ 'arm2' ],
                  waist : [ 'waist2' ],
                  leg   : [ 'leg2' ],
                  weapon: [],
                  oma   : [ 'oma2a', 'oma2b' ] }
            ];
            let got = a.assemble(eqcombs);
            let exp = [
                { head  : 'head1a',
                  body  : 'body1',
                  arm   : 'arm1',
                  waist : 'waist1',
                  leg   : 'leg1',
                  weapon: 'weapon1',
                  oma   : 'oma1' },
                { head  : 'head1b',
                  body  : 'body1',
                  arm   : 'arm1',
                  waist : 'waist1',
                  leg   : 'leg1',
                  weapon: 'weapon1',
                  oma   : 'oma1' },
                { head  : 'head2',
                  body  : 'body2',
                  arm   : 'arm2',
                  waist : 'waist2',
                  leg   : 'leg2',
                  weapon: null,
                  oma   : 'oma2a' },
                { head  : 'head2',
                  body  : 'body2',
                  arm   : 'arm2',
                  leg   : 'leg2',
                  waist : 'waist2',
                  weapon: null,
                  oma   : 'oma2b' }
            ];
            assert.deepEqual(got, exp);
        });

        it('should assemble if null or etc', () => {
            assert.deepEqual(a.assemble(), []);
            assert.deepEqual(a.assemble(null), []);
            assert.deepEqual(a.assemble([]), []);
        });
    });
});
