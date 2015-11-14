'use strict';
const assert = require('power-assert');
const Combinator = require('../../../../lib/equip/combinator');
const myapp = require('../../../support/lib/driver-myapp');

describe('equip/combinator/_combineUsedSp0', () => {
    beforeEach(() => { myapp.initialize(); });

    describe('_makeBulksSetWithSp0()', () => {
        let c = new Combinator();

        it('should make', () => {
            let bulks = c._sortBulks([
                { skillComb: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                { skillComb: { '攻撃': 5, '斬れ味': 0 }, equips: [ '5,0' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 1 }, equips: [ '0,1' ] },
                { skillComb: { '攻撃': 0, '斬れ味': 6 }, equips: [ '0,6' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] },
                { skillComb: { '攻撃': 1, '斬れ味': 0 }, equips: [ '1,0' ] },
                { skillComb: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] }
            ]);
            let sp0 = [
                { skillComb: { '攻撃': 0, '斬れ味': 0 }, equips: [ '0,0' ] }
            ];
            let torsoUp = [
                { skillComb: { '胴系統倍加': 1 }, equips: [ 'torsoUp' ] }
            ];

            let bulksSet = {
                head : bulks,
                body : bulks.concat(sp0),
                arm  : bulks,
                waist: bulks.concat(sp0),
                leg  : torsoUp.concat(bulks),
                // weapon: undefined
                oma  : null
            };

            let got = c._makeBulksSetWithSp0(bulksSet);
            let exp = [
                { head : bulks,
                  body : sp0,
                  arm  : bulks,
                  waist: bulks.concat(sp0),
                  leg  : torsoUp.concat(bulks),
                  weapon: null, oma: null },
                { head : bulks,
                  body : bulks.concat(sp0),
                  arm  : bulks,
                  waist: sp0,
                  leg  : torsoUp.concat(bulks),
                  weapon: null, oma: null }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_combineUsedSp0()', () => {
        let c = new Combinator();

        it('should combine', () => {
            let skillNames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skillComb: { '攻撃': 4, '斬れ味': 2 }, equips: [ '4,2' ] },
                    { skillComb: { '攻撃': 0, '斬れ味': 0 }, equips: [ '0,0' ] } ],
                body: [
                    { skillComb: { '攻撃': 8, '斬れ味': 0 }, equips: [ '8,0' ] },
                    { skillComb: { '攻撃': 6, '斬れ味': 2 }, equips: [ '6,2' ] } ],
                arm: [
                    { skillComb: { '攻撃': 4, '斬れ味': 2 }, equips: [ '4,2' ] },
                    { skillComb: { '攻撃': 0, '斬れ味': 0 }, equips: [ '0,0' ] } ],
                waist: [
                    { skillComb: { '攻撃': 8, '斬れ味': 0 }, equips: [ '8,0' ] },
                    { skillComb: { '攻撃': 6, '斬れ味': 2 }, equips: [ '6,2' ] } ],
                leg: [
                    { skillComb: { '攻撃': 4, '斬れ味': 4 }, equips: [ '4,4' ] },
                    { skillComb: { '攻撃': 5, '斬れ味': 3 }, equips: [ '5,3' ] } ]
            };
            let got = c._combineUsedSp0(skillNames, bulksSet);
            let exp = [
                {
                    eqcombs: [
                        { body  : [ '6,2' ],
                          head  : [ '0,0' ],
                          arm   : [ '4,2' ],
                          waist : [ '6,2' ],
                          leg   : [ '4,4' ],
                          weapon: [],
                          oma   : [],
                          bodySC: { '攻撃': 6, '斬れ味': 2 } }
                    ],
                    sumSC: { '攻撃': 20, '斬れ味': 10 }
                }
                // 先に頭にポイント 0 を使った組み合わせが見つかるので↓は出てこない
                //{
                //    eqcombs: [
                //        { body  : [ '6,2' ],
                //          head  : [ '4,2' ],
                //          arm   : [ '0,0' ],
                //          waist : [ '6,2' ],
                //          leg   : [ '4,4' ],
                //          weapon: [],
                //          oma   : [],
                //          bodySC: { '攻撃': 6, '斬れ味': 2 } }
                //    ],
                //    sumSC: { '攻撃': 20, '斬れ味': 10 }
                //}
            ];
            assert.deepEqual(got, exp);
        });
    });
});
