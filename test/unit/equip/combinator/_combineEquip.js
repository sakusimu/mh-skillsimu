'use strict';
const assert = require('power-assert');
const Combinator = require('../../../../lib/equip/combinator');
const Context = require('../../../../lib/context');
const BorderLine = require('../../../../lib/util').BorderLine;

describe('equip/combinator/_combineEquip', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '業物': { name: '業物', tree: '斬れ味', point: 10 }
    };
    let context = new Context({ skills: SKILLS });

    describe('_newComb()', () => {
        let c = new Combinator(context);

        it('should return new comb', () => {
            let comb = {
                eqcombs: [
                    { head : [ 'head1' ],
                      body : [ 'body1' ],
                      bodySkills: { '攻撃': 1, '斬れ味': 0 } },
                    { head : [ 'head2' ],
                      body : [ 'body2' ],
                      bodySkills: { '攻撃': 0, '斬れ味': 1 } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            let bulk = { skills: { '攻撃': 1, '斬れ味': 1 }, equips: [ 'arm1' ] };
            let got = c._newComb(comb, bulk, 'arm');
            let exp = {
                eqcombs: [
                    { head : [ 'head1' ],
                      body : [ 'body1' ],
                      arm  : [ 'arm1' ],
                      bodySkills: { '攻撃': 1, '斬れ味': 0 } },
                    { head : [ 'head2' ],
                      body : [ 'body2' ],
                      arm  : [ 'arm1' ],
                      bodySkills: { '攻撃': 0, '斬れ味': 1 } }
                ],
                sumSkills: { '攻撃': 2, '斬れ味': 2 }
            };
            assert.deepEqual(got, exp);

            got = comb;
            exp = {
                eqcombs: [
                    { head : [ 'head1' ],
                      body : [ 'body1' ],
                      bodySkills: { '攻撃': 1, '斬れ味': 0 } },
                    { head : [ 'head2' ],
                      body : [ 'body2' ],
                      bodySkills: { '攻撃': 0, '斬れ味': 1 } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            assert.deepEqual(got, exp, 'stable');
        });

        it('should return new comb if bulk is null', () => {
            let comb = {
                eqcombs: [
                    { head : [ 'head1' ],
                      body : [ 'body1' ],
                      bodySkills: { '攻撃': 1, '斬れ味': 0 } },
                    { head : [ 'head2' ],
                      body : [ 'body2' ],
                      bodySkills: { '攻撃': 0, '斬れ味': 1 } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            let got = c._newComb(comb, null, 'arm');
            let exp = {
                eqcombs: [
                    { head : [ 'head1' ],
                      body : [ 'body1' ],
                      arm  : [],
                      bodySkills: { '攻撃': 1, '斬れ味': 0 } },
                    { head : [ 'head2' ],
                      body : [ 'body2' ],
                      arm  : [],
                      bodySkills: { '攻撃': 0, '斬れ味': 1 } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            assert.deepEqual(got, exp);
        });

        it('should return new comb if comb is null', () => {
            let bulk = { skills: { '攻撃': 1, '斬れ味': 1 }, equips: [ 'body1' ] };
            let got = c._newComb(null, bulk, 'body');
            let exp = {
                eqcombs: [
                    { body : [ 'body1' ],
                      bodySkills: { '攻撃': 1, '斬れ味': 1 } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('_combineEquip()', () => {
        let c = new Combinator(context);
        let skillnames = [ '攻撃力UP【大】', '業物' ];

        it('should combine leg (done: body, head, arm, waist)', () => {
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] } ],
                body: [
                    { skills: { '攻撃': 5, '斬れ味': 1 }, equips: [ '5,1' ] } ],
                arm: [
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] } ],
                waist: [
                    { skills: { '攻撃': 5, '斬れ味': 1 }, equips: [ '5,1' ] } ],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                    { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ '6,0' ] },
                    { skills: { '攻撃': 0, '斬れ味': 4 }, equips: [ '0,4' ] },
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] },
                    { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] } ],
                charm: [
                    { skills: { '攻撃': 4, '斬れ味': 0 }, equips: [ '4,0' ] },
                    { skills: { '攻撃': 0, '斬れ味': 2 }, equips: [ '0,2' ] } ]
            };
            let borderLine = new BorderLine(context, skillnames, bulksSet);
            let comb = {
                eqcombs: [
                    { head : [ '1,3' ],
                      body : [ '5,1' ],
                      arm  : [ '1,3' ],
                      waist: [ '5,1' ],
                      bodySkills: { '攻撃': 5, '斬れ味': 1 }
                    }
                ],
                sumSkills: { '攻撃': 12, '斬れ味': 8 }
            };

            // body, head, arm, waist まで終わってて、これから leg を処理するところ
            let bulks = [
                { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ '6,0' ] },
                { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] },
                { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                { skills: { '攻撃': 0, '斬れ味': 4 }, equips: [ '0,4' ] },
                { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] }
            ];
            let got = c._combineEquip(comb, bulks, borderLine, 'leg');
            let exp = [
                {
                    eqcombs: [
                        { head : [ '1,3' ],
                          body : [ '5,1' ],
                          arm  : [ '1,3' ],
                          waist: [ '5,1' ],
                          leg  : [ '6,0' ],
                          bodySkills: { '攻撃': 5, '斬れ味': 1 } }
                    ],
                    sumSkills: { '攻撃': 18, '斬れ味': 8 }
                }
            ];
            assert.deepEqual(got, exp);

            it('should combine uncorrectly if specify unsorted bulks', () => {
                // bulks がソートされていないとちゃんと動かない
                let bulks = [
                    { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                    { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ '6,0' ] },
                    { skills: { '攻撃': 0, '斬れ味': 4 }, equips: [ '0,4' ] },
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] },
                    { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] }
                ];
                let got = c._combineEquip(comb, bulks, borderLine, 'leg');
                let exp = [];
                assert.deepEqual(got, exp);
            });
        });

        it('should combine if contain torsoUp', () => {
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] } ],
                body: [
                    { skills: { '攻撃': 5, '斬れ味': 1 }, equips: [ '5,1' ] } ],
                arm: [
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] } ],
                waist: [
                    { skills: { '胴系統倍加': 1 }, equips: [ 'torsoUp' ] } ],
                leg: [
                    { skills: { '胴系統倍加': 1 }, equips: [ 'torsoUp' ] },
                    { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                    { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ '6,0' ] },
                    { skills: { '攻撃': 0, '斬れ味': 4 }, equips: [ '0,4' ] },
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] },
                    { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] } ],
                charm: [
                    { skills: { '攻撃': 4, '斬れ味': 0 }, equips: [ '4,0' ] },
                    { skills: { '攻撃': 0, '斬れ味': 2 }, equips: [ '0,2' ] } ]
            };
            let borderLine = new BorderLine(context, skillnames, bulksSet);
            let comb = {
                eqcombs: [
                    { head : [ '1,3' ],
                      body : [ '5,1' ],
                      arm  : [ '1,3' ],
                      waist: [ 'torsoUp' ],
                      bodySkills: { '攻撃': 5, '斬れ味': 1 } }
                ],
                sumSkills: { '攻撃': 12, '斬れ味': 8 }
            };
            // 胴系統倍加は先にあってもOK
            let bulks = [
                { skills: { '胴系統倍加': 1 }, equips: [ 'torsoUp' ] },
                { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ '6,0' ] },
                { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] },
                { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                { skills: { '攻撃': 0, '斬れ味': 4 }, equips: [ '0,4' ] },
                { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] }
            ];
            let got = c._combineEquip(comb, bulks, borderLine, 'leg');
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
                        { head : [ '1,3' ],
                          body : [ '5,1' ],
                          arm  : [ '1,3' ],
                          waist: [ 'torsoUp' ],
                          leg  : [ '6,0' ],
                          bodySkills: { '攻撃': 5, '斬れ味': 1 } }
                    ],
                    sumSkills: { '攻撃': 18, '斬れ味': 8 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine body (done: none)', () => {
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] } ],
                body: [
                    { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                    { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ '6,0' ] },
                    { skills: { '攻撃': 0, '斬れ味': 4 }, equips: [ '0,4' ] },
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] },
                    { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] } ],
                arm: [
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] } ],
                waist: [
                    { skills: { '攻撃': 5, '斬れ味': 1 }, equips: [ '5,1' ] } ],
                leg: [
                    { skills: { '攻撃': 5, '斬れ味': 1 }, equips: [ '5,1' ] } ],
                charm: [
                    { skills: { '攻撃': 4, '斬れ味': 0 }, equips: [ '4,0' ] },
                    { skills: { '攻撃': 0, '斬れ味': 2 }, equips: [ '0,2' ] } ]
            };
            let borderLine = new BorderLine(context, skillnames, bulksSet);
            let comb = { eqcombs: [], sumSkills: 0 };
            let bulks = [
                { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ '6,0' ] },
                { skills: { '攻撃': 4, '斬れ味': 1 }, equips: [ '4,1' ] },
                { skills: { '攻撃': 3, '斬れ味': 2 }, equips: [ '3,2' ] },
                { skills: { '攻撃': 0, '斬れ味': 4 }, equips: [ '0,4' ] },
                { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] }
            ];
            let got = c._combineEquip(comb, bulks, borderLine, 'body');
            let exp = [
                {
                    eqcombs: [
                        { body : [ '6,0' ],
                          bodySkills: { '攻撃': 6, '斬れ味': 0 } }
                    ],
                    sumSkills: { '攻撃': 6, '斬れ味': 0 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if bulks is []', () => {
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] } ],
                body: [
                    { skills: { '攻撃': 5, '斬れ味': 1 }, equips: [ '5,1' ] } ],
                arm: [
                    { skills: { '攻撃': 1, '斬れ味': 3 }, equips: [ '1,3' ] } ],
                waist: [
                    { skills: { '攻撃': 5, '斬れ味': 1 }, equips: [ '5,1' ] } ],
                leg: [
                    { skills: { '攻撃': 6, '斬れ味': 0 }, equips: [ '6,0' ] } ],
                charm: [
                    { skills: { '攻撃': 4, '斬れ味': 0 }, equips: [ '4,0' ] },
                    { skills: { '攻撃': 0, '斬れ味': 2 }, equips: [ '0,2' ] } ]
            };
            let borderLine = new BorderLine(context, skillnames, bulksSet);
            let comb = {
                eqcombs: [
                    { head : [ '1,3' ],
                      body : [ '5,1' ],
                      arm  : [ '1,3' ],
                      waist: [ '5,1' ],
                      leg  : [ '6,0' ],
                      bodySkills: { '攻撃': 5, '斬れ味': 1 } }
                ],
                sumSkills: { '攻撃': 18, '斬れ味': 8 }
            };
            let got = c._combineEquip(comb, [], borderLine, 'weapon');
            let exp = [
                {
                    eqcombs: [
                        { head : [ '1,3' ],
                          body : [ '5,1' ],
                          arm  : [ '1,3' ],
                          waist: [ '5,1' ],
                          leg  : [ '6,0' ],
                          weapon: [],
                          bodySkills: { '攻撃': 5, '斬れ味': 1 } }
                    ],
                    sumSkills: { '攻撃': 18, '斬れ味': 8 }
                }
            ];
            assert.deepEqual(got, exp);
        });
    });
});
