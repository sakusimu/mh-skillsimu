'use strict';
const assert = require('power-assert');
const Combinator = require('../../../../lib/deco/combinator');
const Context = require('../../../../lib/context');
const BorderLine = require('../../../../lib/util').BorderLine;

describe('deco/combinator/_combineDeco', () => {
    const SKILLS = {
        '攻撃力UP【大】': { name: '攻撃力UP【大】', tree: '攻撃', point: 20 },
        '業物': { name: '業物', tree: '斬れ味', point: 10 }
    };
    let context = new Context({ skills: SKILLS });

    describe('_newComb()', () => {
        let c = new Combinator(context);

        it('should return new comb', () => {
            let comb = {
                decombs: [
                    { head : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } },
                      body : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } } },
                    { head : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } },
                      body : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            let bulk = {
                skills: { '攻撃': 1, '斬れ味': 1 },
                decos: [ '攻撃珠【１】', '斬鉄珠【１】' ],
                slot: 2
            };
            let got = c._newComb(comb, bulk, 'arm');
            let exp = {
                decombs: [
                    { head : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } },
                      body : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } },
                      arm  : { decos: [ '攻撃珠【１】', '斬鉄珠【１】' ], slot: 2,
                               skills: { '攻撃': 1, '斬れ味': 1 } } },
                    { head : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } },
                      body : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } },
                      arm  : { decos: [ '攻撃珠【１】', '斬鉄珠【１】' ], slot: 2,
                               skills: { '攻撃': 1, '斬れ味': 1 } } }
                ],
                sumSkills: { '攻撃': 2, '斬れ味': 2 }
            };
            assert.deepEqual(got, exp);

            got = comb;
            exp = {
                decombs: [
                    { head : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } },
                      body : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } } },
                    { head : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } },
                      body : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            assert.deepEqual(got, exp, 'stable');
        });

        it('should return new comb if bulk is null', () => {
            let comb = {
                decombs: [
                    { head : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } },
                      body : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } } },
                    { head : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } },
                      body : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            let got = c._newComb(comb, null, 'arm');
            let exp = {
                decombs: [
                    { head : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } },
                      body : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } },
                      arm  : { decos: [], slot: 0, skills: {} } },
                    { head : { decos: [ '攻撃珠【１】' ], slot: 1,
                               skills: { '攻撃': 1, '斬れ味': 0 } },
                      body : { decos: [ '斬鉄珠【１】' ], slot: 1,
                               skills: { '攻撃': 0, '斬れ味': 1 } },
                      arm  : { decos: [], slot: 0, skills: {} } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            assert.deepEqual(got, exp);
        });

        it('should return new comb if comb is null', () => {
            let bulk = {
                skills: { '攻撃': 1, '斬れ味': 1 },
                decos: [ '攻撃珠【１】', '斬鉄珠【１】' ],
                slot: 2
            };
            let got = c._newComb(null, bulk, 'body');
            let exp = {
                decombs: [
                    { body : { decos: [ '攻撃珠【１】', '斬鉄珠【１】' ], slot: 2,
                               skills: { '攻撃': 1, '斬れ味': 1 } } }
                ],
                sumSkills: { '攻撃': 1, '斬れ味': 1 }
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('_combineDeco()', () => {
        let c = new Combinator(context);
        let skillnames = [ '攻撃力UP【大】', '業物' ];

        it('should combine waist (done: body, head, arm, waist)', () => {
            // body, head, arm まで終わってて、これから waist を処理するところ
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 },
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                body: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 },
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                arm: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                waist: [
                    { skills: { '攻撃': 2, '斬れ味': 0 }, decos: [ '2,0' ], slot: 2 },
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 },
                    { skills: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 2 },
                    { skills: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                charm: [
                    { skills: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSkills = { '攻撃': 13, '斬れ味': 6 };
            let borderLine = new BorderLine(context, skillnames, bulksSet, equipSkills);
            let comb = {
                decombs: [
                    { head: bulksSet.head[0],
                      body: bulksSet.body[1],
                      arm : bulksSet.arm[0] },
                    { head: bulksSet.head[1],
                      body: bulksSet.body[0],
                      arm : bulksSet.arm[0] }
                ],
                sumSkills: { '攻撃': 3, '斬れ味': 2 }
            };
            let bulks = bulksSet.waist;
            let got = c._combineDeco(comb, bulks, borderLine, 'waist');
            let exp = [ // 結果の waist は、合計が 2 で斬れ味に 1 以上のものになる
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[1],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[2] },
                        { head : bulksSet.head[1],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[2] }
                    ],
                    sumSkills: { '攻撃': 4, '斬れ味': 3 }
                },
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[1],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[3] },
                        { head : bulksSet.head[1],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[3] }
                    ],
                    sumSkills: { '攻撃': 3, '斬れ味': 4 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should not skip slot3 if find slot2', () => {
            // スロ2で見つかってもスロ3も見つける
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                body: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                arm: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                waist: [
                    { skills: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 },
                    { skills: { '攻撃': 1, '斬れ味': 2 }, decos: [ '1,2' ], slot: 3 } ],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                charm: [
                    { skills: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSkills = { '攻撃': 13, '斬れ味': 6 };
            let borderLine = new BorderLine(context, skillnames, bulksSet, equipSkills);
            let comb = {
                decombs: [
                    { head: bulksSet.head[0],
                      body: bulksSet.body[0],
                      arm : bulksSet.arm[0] }
                ],
                sumSkills: { '攻撃': 3, '斬れ味': 2 }
            };
            let bulks = bulksSet.waist;
            let got = c._combineDeco(comb, bulks, borderLine, 'waist');
            let exp = [
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[0] }
                    ],
                    sumSkills: { '攻撃': 3, '斬れ味': 4 }
                },
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[1] }
                    ],
                    sumSkills: { '攻撃': 4, '斬れ味': 4 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if contain torsoUp', () => {
            let bulksSet = {
                head: [
                    { skills: { '胴系統倍加': 1 }, decos: [ 'torsoUp' ], slot: 0 } ],
                body: [
                    { skills: { '攻撃': 3, '斬れ味': 1 }, decos: [ '3,1' ], slot: 3 } ],
                arm: [
                    { skills: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                waist: [
                    { skills: { '攻撃': 3, '斬れ味': 1 }, decos: [ '1,3' ], slot: 3 } ],
                leg: [
                    { skills: { '攻撃': 0, '斬れ味': 0 }, decos: [ '0,0' ], slot: 0 },
                    { skills: { '胴系統倍加': 1 }, decos: [ 'torsoUp' ], slot: 0 },
                    { skills: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 2 },
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 },
                    { skills: { '攻撃': 3, '斬れ味': 1 }, decos: [ '3,1' ], slot: 3 } ],
                charm: [
                    { skills: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 1 } ]
            };
            let equipSkills = { '攻撃': 7, '斬れ味': 4 };
            let borderLine = new BorderLine(context, skillnames, bulksSet, equipSkills);
            let comb = {
                decombs: [
                    { head : bulksSet.head[0],
                      body : bulksSet.body[0],
                      arm  : bulksSet.arm[0],
                      waist: bulksSet.waist[0] }
                ],
                sumSkills: { '攻撃': 9, '斬れ味': 4 }
            };
            let bulks = bulksSet.leg;
            let got = c._combineDeco(comb, bulks, borderLine, 'leg');
            let exp = [
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[0],
                          leg  : bulksSet.leg[1] }
                    ],
                    sumSkills: { '攻撃': 12, '斬れ味': 5 }
                },
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[0],
                          leg  : bulksSet.leg[4] }
                    ],
                    sumSkills: { '攻撃': 12, '斬れ味': 5 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine body (done: none)', () => {
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                body: [
                    { skills: { '攻撃': 2, '斬れ味': 0 }, decos: [ '2,0' ], slot: 2 },
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 },
                    { skills: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 2 },
                    { skills: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                arm: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                waist: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                charm: [
                    { skills: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSkills = { '攻撃': 13, '斬れ味': 6 };
            let borderLine = new BorderLine(context, skillnames, bulksSet, equipSkills);
            let comb = { decombs: [], sumSkills: 0 };
            let bulks = bulksSet.body;
            let got = c._combineDeco(comb, bulks, borderLine, 'body');
            let exp = [
                {
                    decombs: [
                        { body : bulksSet.body[2] }
                    ],
                    sumSkills: { '攻撃': 1, '斬れ味': 1 }
                },
                {
                    decombs: [
                        { body : bulksSet.body[3] }
                    ],
                    sumSkills: { '攻撃': 0, '斬れ味': 2 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if skill already activates', () => {
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                body: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                arm: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                waist: [
                    { skills: { '攻撃': 2, '斬れ味': 0 }, decos: [ '2,0' ], slot: 2 },
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 },
                    { skills: { '攻撃': 1, '斬れ味': 1 }, decos: [ '1,1' ], slot: 2 },
                    { skills: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                charm: [
                    { skills: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSkills = { '攻撃': 20, '斬れ味': 10 };
            let borderLine = new BorderLine(context, skillnames, bulksSet, equipSkills);
            let comb = { decombs: [], sumSkills: {} };
            let bulks = bulksSet.body;
            let got = c._combineDeco(comb, bulks, borderLine, 'body');
            let exp = [
                {
                    decombs: [
                        { body: bulksSet.body[0] }
                    ],
                    sumSkills: { '攻撃': 3, '斬れ味': 0 }
                }
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if bulks is null', () => {
            let bulksSet = {
                head: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                body: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                arm: [
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ],
                waist: [
                    { skills: { '攻撃': 0, '斬れ味': 2 }, decos: [ '0,2' ], slot: 2 } ],
                leg: [
                    { skills: { '攻撃': 3, '斬れ味': 0 }, decos: [ '3,0' ], slot: 2 } ],
                charm: [
                    { skills: { '攻撃': 1, '斬れ味': 0 }, decos: [ '1,0' ], slot: 1 },
                    { skills: { '攻撃': 0, '斬れ味': 1 }, decos: [ '0,1' ], slot: 1 } ]
            };
            let equipSkills = { '攻撃': 13, '斬れ味': 6 };
            let borderLine = new BorderLine(context, skillnames, bulksSet, equipSkills);
            let comb = {
                decombs: [
                    { head : bulksSet.head[0],
                      body : bulksSet.body[0],
                      arm  : bulksSet.arm[0],
                      waist: bulksSet.waist[0],
                      leg  : bulksSet.leg[0] }
                ],
                sumSkills: { '攻撃': 6, '斬れ味': 4 }
            };
            let bulks = bulksSet.weapon;
            let got = c._combineDeco(comb, bulks, borderLine, 'weapon');
            let exp = [
                {
                    decombs: [
                        { head : bulksSet.head[0],
                          body : bulksSet.body[0],
                          arm  : bulksSet.arm[0],
                          waist: bulksSet.waist[0],
                          leg  : bulksSet.leg[0],
                          weapon: { decos: [], slot: 0, skills: {} } }
                    ],
                    sumSkills: { '攻撃': 6, '斬れ味': 4 }
                }
            ];
            assert.deepEqual(got, exp);
        });
    });
});
