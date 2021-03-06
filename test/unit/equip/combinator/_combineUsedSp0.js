'use strict';
const assert = require('power-assert');
const Combinator = require('../../../../lib/equip/combinator');
const Context = require('../../../../lib/context');

describe('equip/combinator/_combineUsedSp0', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '業物': { name: '業物', tree: '斬れ味', point: 10 }
    };
    let context = new Context({ skills: SKILLS });

    describe('_makeBulksSetWithSp0()', () => {
        let c = new Combinator(context);

        it('should make', () => {
            let bulks = c._sortBulks([
                { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                { skills: { '攻撃': 5, '斬れ味': 0 }, equips: [ '5,0' ] },
                { skills: { '攻撃': 0, '斬れ味': 1 }, equips: [ '0,1' ] },
                { skills: { '攻撃': 0, '斬れ味': 6 }, equips: [ '0,6' ] },
                { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] },
                { skills: { '攻撃': 1, '斬れ味': 0 }, equips: [ '1,0' ] },
                { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] }
            ]);
            let sp0 = [
                { skills: { '攻撃': 0, '斬れ味': 0 }, equips: [ '0,0' ] }
            ];
            let torsoUp = [
                { skills: { '胴系統倍加': 1 }, equips: [ 'torsoUp' ] }
            ];

            let bulksSet = {
                head : bulks,
                body : bulks.concat(sp0),
                arm  : bulks,
                waist: bulks.concat(sp0),
                leg  : torsoUp.concat(bulks),
                // weapon: undefined
                charm: null
            };

            let got = c._makeBulksSetWithSp0(bulksSet);
            let exp = [
                { head : bulks,
                  body : sp0,
                  arm  : bulks,
                  waist: bulks.concat(sp0),
                  leg  : torsoUp.concat(bulks),
                  weapon: null, charm: null },
                { head : bulks,
                  body : bulks.concat(sp0),
                  arm  : bulks,
                  waist: sp0,
                  leg  : torsoUp.concat(bulks),
                  weapon: null, charm: null }
            ];
            assert.deepEqual(got, exp);
        });
    });

    describe('_combineUsedSp0()', () => {
        let c = new Combinator(context);

        it('should combine', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 4, '斬れ味': 2 }, equips: [ '4,2' ] },
                    { skills: { '攻撃': 0, '斬れ味': 0 }, equips: [ '0,0' ] } ],
                body: [
                    { skills: { '攻撃': 8, '斬れ味': 0 }, equips: [ '8,0' ] },
                    { skills: { '攻撃': 6, '斬れ味': 2 }, equips: [ '6,2' ] } ],
                arm: [
                    { skills: { '攻撃': 4, '斬れ味': 2 }, equips: [ '4,2' ] },
                    { skills: { '攻撃': 0, '斬れ味': 0 }, equips: [ '0,0' ] } ],
                waist: [
                    { skills: { '攻撃': 8, '斬れ味': 0 }, equips: [ '8,0' ] },
                    { skills: { '攻撃': 6, '斬れ味': 2 }, equips: [ '6,2' ] } ],
                leg: [
                    { skills: { '攻撃': 4, '斬れ味': 4 }, equips: [ '4,4' ] },
                    { skills: { '攻撃': 5, '斬れ味': 3 }, equips: [ '5,3' ] } ]
            };
            let got = c._combineUsedSp0(skillnames, bulksSet);
            let exp = [
                {
                    eqcombs: [
                        { body  : [ '6,2' ],
                          head  : [ '0,0' ],
                          arm   : [ '4,2' ],
                          waist : [ '6,2' ],
                          leg   : [ '4,4' ],
                          weapon: [],
                          charm : [],
                          bodySkills: { '攻撃': 6, '斬れ味': 2 } }
                    ],
                    sumSkills: { '攻撃': 20, '斬れ味': 10 }
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
                //          charm : [],
                //          bodySkills: { '攻撃': 6, '斬れ味': 2 } }
                //    ],
                //    sumSkills: { '攻撃': 20, '斬れ味': 10 }
                //}
            ];
            assert.deepEqual(got, exp);
        });
    });
});
