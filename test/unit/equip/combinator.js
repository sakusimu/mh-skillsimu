'use strict';
const assert = require('power-assert');
const Combinator = require('../../../lib/equip/combinator');
const Context = require('../../../lib/context');

describe('equip/combinator', () => {
    let context = new Context();

    describe('constructor()', () => {
        it('should create combinator', () => {
            let c = new Combinator(context);
            assert(c);
            assert(c.context === context);
        });

        it('should throw exception if no arguments', () => {
            let got;
            try { new Combinator(); } catch (e) { got = e.message; }
            assert(got === 'context is required');
        });
    });

    describe('_sortBulks()', () => {
        let c = new Combinator(context);

        it('should sort', () => {
            let bulks = [
                { skills: { '攻撃': 3, '斬れ味': 2 } },
                { skills: { '攻撃': 0, '斬れ味': 0 } },
                { skills: { '攻撃': 0, '斬れ味': 1 } },
                { skills: { '攻撃': -2, '斬れ味': 2 } },
                { skills: { '攻撃': 0, '斬れ味': 6 } },
                { skills: { '攻撃': 5, '斬れ味': 0 } },
                { skills: { '攻撃': 1, '斬れ味': 3 } },
                { skills: { '攻撃': 6, '斬れ味': 6 } },
                { skills: { '攻撃': 1, '斬れ味': -3 } },
                { skills: { '攻撃': 1, '斬れ味': 0 } },
                { skills: { '攻撃': 4, '斬れ味': 1 } }
            ];
            let got = c._sortBulks(bulks);
            let exp = [
                { skills: { '攻撃': 6, '斬れ味': 6 } },
                { skills: { '攻撃': 0, '斬れ味': 6 } },
                { skills: { '攻撃': 3, '斬れ味': 2 } },
                { skills: { '攻撃': 5, '斬れ味': 0 } },
                { skills: { '攻撃': 4, '斬れ味': 1 } },
                { skills: { '攻撃': 1, '斬れ味': 3 } },
                { skills: { '攻撃': 0, '斬れ味': 1 } },
                { skills: { '攻撃': 1, '斬れ味': 0 } },
                { skills: { '攻撃': 0, '斬れ味': 0 } },
                { skills: { '攻撃': -2, '斬れ味': 2 } },
                { skills: { '攻撃': 1, '斬れ味': -3 } }
            ];
            assert.deepEqual(got, exp);
        });

        it('should sort if contain torsoUp', () => {
            let bulks = [
                { skills: { '攻撃': 3, '斬れ味': 2 } },
                { skills: { '攻撃': 0, '斬れ味': 0 } },
                { skills: { '攻撃': 1, '斬れ味': 3 } },
                { skills: { '胴系統倍加': 1 } },
                { skills: { '攻撃': 4, '斬れ味': 1 } }
            ];
            let got = c._sortBulks(bulks);
            let exp = [
                { skills: { '胴系統倍加': 1 } },
                { skills: { '攻撃': 3, '斬れ味': 2 } },
                { skills: { '攻撃': 4, '斬れ味': 1 } },
                { skills: { '攻撃': 1, '斬れ味': 3 } },
                { skills: { '攻撃': 0, '斬れ味': 0 } }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_brushUp()', () => {
        let c = new Combinator(context);

        it('should brush up', () => {
            let combs = [
                {
                    eqcombs: [
                        { head  : [ 'head1' ],
                          body  : [ 'body1' ],
                          arm   : [ 'arm1' ],
                          waist : [ 'waist1' ],
                          leg   : [ 'leg1' ],
                          weapon: [ 'weapon1' ],
                          charm : [ 'charm1' ],
                          bodySkills: { '攻撃': 1, '斬れ味': 1 } },
                        { head  : [ 'head2' ],
                          body  : [ 'body2' ],
                          arm   : [ 'arm2' ],
                          waist : [ 'waist2' ],
                          leg   : [ 'leg2' ],
                          //weapon: undefined,
                          charm : null,
                          bodySkills: {} }
                    ],
                    sumSkills: {}
                },
                {
                    eqcombs: [
                        { head  : [ 'head3' ],
                          body  : [ 'body3' ],
                          arm   : [ 'arm3' ],
                          waist : [ 'waist3' ],
                          leg   : [ 'leg3' ],
                          weapon: [ 'weapon3' ],
                          charm : [ 'charm3' ],
                          bodySkills: {} }
                    ],
                    sumSkills: {}
                }
            ];
            let got = c._brushUp(combs);
            let exp = [
                { head  : [ 'head1' ],
                  body  : [ 'body1' ],
                  arm   : [ 'arm1' ],
                  waist : [ 'waist1' ],
                  leg   : [ 'leg1' ],
                  weapon: [ 'weapon1' ],
                  charm : [ 'charm1' ] },
                { head  : [ 'head2' ],
                  body  : [ 'body2' ],
                  arm   : [ 'arm2' ],
                  waist : [ 'waist2' ],
                  leg   : [ 'leg2' ],
                  weapon: [],
                  charm : [] },
                { head  : [ 'head3' ],
                  body  : [ 'body3' ],
                  arm   : [ 'arm3' ],
                  waist : [ 'waist3' ],
                  leg   : [ 'leg3' ],
                  weapon: [ 'weapon3' ],
                  charm : [ 'charm3' ] }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('combine()', () => {
        let c = new Combinator(context);

        it('should combine if null or etc', () => {
            assert.deepEqual(c.combine(), []);
            assert.deepEqual(c.combine(null), []);
            assert.deepEqual(c.combine({}), []);

            assert.deepEqual(c.combine([ '攻撃力UP【大】' ]), []);
            assert.deepEqual(c.combine([ '攻撃力UP【大】' ], null), []);
            assert.deepEqual(c.combine([ '攻撃力UP【大】' ], {}), []);
        });
    });
});
