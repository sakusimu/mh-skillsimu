'use strict';
const assert = require('power-assert');
const Combinator = require('../../../../lib/equip/combinator');
const Context = require('../../../../lib/context');
const BorderLine = require('../../../../lib/util').BorderLine;

describe('equip/combinator/_combineTorsoUp', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '業物': { name: '業物', tree: '斬れ味', point: 10 }
    };
    let context = new Context({ skills: SKILLS });

    describe('_combineTorsoUp()', () => {
        let c = new Combinator(context);

        it('should combine', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 1, '斬れ味': 3 } },
                    { skills: { '攻撃': 2, '斬れ味': 3 } },
                    { skills: { '攻撃': 0, '斬れ味': 4 } },
                    { skills: { '攻撃': 4, '斬れ味': 0 } } ],
                body: [
                    { skills: { '攻撃': 5, '斬れ味': 1 } },
                    { skills: { '攻撃': 4, '斬れ味': 1 } },
                    { skills: { '攻撃': 6, '斬れ味': 0 } } ],
                arm: [
                    { skills: { '攻撃': 1, '斬れ味': 3 } },
                    { skills: { '攻撃': 2, '斬れ味': 3 } },
                    { skills: { '攻撃': 0, '斬れ味': 4 } },
                    { skills: { '攻撃': 4, '斬れ味': 0 } } ],
                waist: [
                    { skills: { '胴系統倍加': 1 } } ],
                leg: [
                    { skills: { '胴系統倍加': 1 } } ],
                charm: [
                    { skills: { '攻撃': 3, '斬れ味': 1 } },
                    { skills: { '攻撃': 2, '斬れ味': 2 } } ]
            };
            let borderLine = new BorderLine(context, skillnames, bulksSet);

            let comb = {
                eqcombs: [
                    { head : [ '1,3' ],
                      body : [ '5,1' ],
                      arm  : [ '1,3' ],
                      waist: [ 'torsoUp' ],
                      bodySkills: { '攻撃': 5, '斬れ味': 1 } },
                    { head : [ '2,3' ],
                      body : [ '4,1' ],
                      arm  : [ '2,3' ],
                      waist: [ 'torsoUp' ],
                      bodySkills: { '攻撃': 4, '斬れ味': 1 } },
                    { head : [ '0,4' ],
                      body : [ '6,0' ],
                      arm  : [ '0,4' ],
                      waist: [ 'torsoUp' ],
                      bodySkills: { '攻撃': 6, '斬れ味': 0 } }
                ],
                sumSkills: { '攻撃': 12, '斬れ味': 8 }
            };
            let bulk = { skills: { '胴系統倍加': 1 }, equips: [ 'torsoUp' ] };
            let got = c._combineTorsoUp(comb, bulk, borderLine, 'leg');
            let exp = [
                {
                    eqcombs: [
                        { head : [ '1,3' ],
                          body : [ '5,1' ],
                          arm  : [ '1,3' ],
                          waist: [ 'torsoUp' ],
                          leg  : [ 'torsoUp' ],
                          bodySkills: { '攻撃': 5, '斬れ味': 1 } }
                    ],
                    sumSkills: { '攻撃': 17, '斬れ味': 9 }
                },
                {
                    eqcombs: [
                        { head : [ '0,4' ],
                          body : [ '6,0' ],
                          arm  : [ '0,4' ],
                          waist: [ 'torsoUp' ],
                          leg  : [ 'torsoUp' ],
                          bodySkills: { '攻撃': 6, '斬れ味': 0 } }
                    ],
                    sumSkills: { '攻撃': 18, '斬れ味': 8 }
                }
            ];
            assert.deepEqual(got, exp);
        });
    });
});
