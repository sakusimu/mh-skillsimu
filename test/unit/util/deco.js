'use strict';
const assert = require('power-assert');
const util = require('../../../lib/util/deco');

describe('util/deco', () => {
    const DECOS = [
        { name: '耐絶珠【１】', slot: 1, skills: { '気絶': 1, '麻痺': -1 } },
        { name: '制絶珠【１】', slot: 1, skills: { '気絶': 2 } },
        { name: '攻撃珠【１】', slot: 1, skills: { '攻撃': 1, '防御': -1 } },
        { name: '攻撃珠【２】', slot: 2, skills: { '攻撃': 3, '防御': -1 } },
        { name: '攻撃珠【３】', slot: 3, skills: { '攻撃': 5, '防御': -1 } },
        { name: '達人珠【１】', slot: 1, skills: { '達人': 1, '龍耐性': -1 } },
        { name: '達人珠【２】', slot: 2, skills: { '達人': 3, '龍耐性': -1 } },
        { name: '達人珠【３】', slot: 3, skills: { '達人': 5, '龍耐性': -1 } },
        { name: '匠珠【２】', slot: 2, skills: { '匠': 1, '斬れ味': -1 } },
        { name: '匠珠【３】', slot: 3, skills: { '匠': 2, '斬れ味': -2 } },
        { name: '斬鉄珠【１】', slot: 1, skills: { '斬れ味': 1, '匠': -1 } },
        { name: '斬鉄珠【３】', slot: 3, skills: { '斬れ味': 4, '匠': -2 } },
        { name: '採取珠【１】', slot: 1, skills: { '採取': 2 } },
        { name: '速集珠【１】', slot: 1, skills: { '高速収集': 2 } }
    ];

    describe('filter()', () => {
        let kireaji = [ '斬鉄珠【１】', '斬鉄珠【３】' ];
        let kougeki = [ '攻撃珠【１】', '攻撃珠【２】', '攻撃珠【３】' ];
        let takumi  = [ '匠珠【２】', '匠珠【３】' ];

        it('should filter', () => {
            let got = util.filter(DECOS, [ '斬れ味' ]).map(d => d.name).sort();
            let exp = kireaji.sort();
            assert.deepEqual(got, exp);
        });

        it('should filter if 2 skills', () => {
            let got = util.filter(DECOS, [ '斬れ味', '攻撃' ]).map(d => d.name).sort();
            let exp = kireaji.concat(kougeki).sort();
            assert.deepEqual(got, exp);
        });

        it('should filter if conflict skills', () => {
            // 斬れ味と匠みたくプラスマイナスが反発する場合でも両方とれてるか
            let got = util.filter(DECOS, [ '斬れ味', '匠' ]).map(d => d.name).sort();
            let exp = kireaji.concat(takumi).sort();
            assert.deepEqual(got, exp);
        });

        it('should filter if specify nonexistent skill tree', () => {
            let got = util.filter(DECOS, [ 'hoge' ]);
            let exp = [];
            assert.deepEqual(got, exp);

            got = util.filter(DECOS, [ '斬れ味', 'hoge' ]).map(d => d.name).sort();
            exp = kireaji.sort();
            assert.deepEqual(got, exp);
        });

        it('should return [] if null or etc', () => {
            assert.deepEqual(util.filter(), []);
            assert.deepEqual(util.filter(null), []);
            assert.deepEqual(util.filter([]), []);

            assert.deepEqual(util.filter([]), []);
            assert.deepEqual(util.filter([], null), []);
            assert.deepEqual(util.filter([], []), []);
        });
    });

    describe('_rcomb1()', () => {
        it('should return comb correctly', () => {
            let got = util._rcomb1([ 'a', 'b', 'c' ]);
            let exp = [
                [ 'a' ], [ 'b' ], [ 'c' ]
            ];
            assert.deepEqual(got, exp);

            assert.deepEqual(util._rcomb1([]), []);
        });
    });

    describe('_rcomb2()', () => {
        it('should return comb correctly', () => {
            let got = util._rcomb2([ 'a', 'b', 'c' ]);
            let exp = [
                [ 'a', 'a' ], [ 'a', 'b' ], [ 'a', 'c' ],
                [ 'b', 'b' ], [ 'b', 'c' ],
                [ 'c', 'c' ]
            ];
            assert.deepEqual(got, exp);

            assert.deepEqual(util._rcomb2([]), []);
        });
    });

    describe('_rcomb3()', () => {
        it('should return comb correctly', () => {
            let got = util._rcomb3([ 'a', 'b', 'c' ]);
            let exp = [
                [ 'a', 'a', 'a' ], [ 'a', 'a', 'b' ], [ 'a', 'a', 'c' ],
                [ 'a', 'b', 'b' ], [ 'a', 'b', 'c' ], [ 'a', 'c', 'c' ],
                [ 'b', 'b', 'b' ], [ 'b', 'b', 'c' ], [ 'b', 'c', 'c' ],
                [ 'c', 'c', 'c' ]
            ];
            assert.deepEqual(got, exp);

            assert.deepEqual(util._rcomb3([]), []);
        });
    });

    describe('_groupBySlot()', () => {
        function name(decosList) {
            let ret = {};
            Object.keys(decosList).forEach(slot => {
                let decos = decosList[slot];
                ret[slot] = decos.map(d => d.name);
            });
            return ret;
        }

        it('should group by correctly', () => {
            let decos = util.filter(DECOS, [ '攻撃' ]);
            let group = util._groupBySlot(decos);
            let got = name(group);
            let exp = {
                '1': [ '攻撃珠【１】' ],
                '2': [ '攻撃珠【２】' ],
                '3': [ '攻撃珠【３】' ]
            };
            assert.deepEqual(got, exp);

            decos = util.filter(DECOS, [ '攻撃', '達人' ]);
            group = util._groupBySlot(decos);
            got = name(group);
            exp = {
                '1': [ '攻撃珠【１】', '達人珠【１】' ],
                '2': [ '攻撃珠【２】', '達人珠【２】' ],
                '3': [ '攻撃珠【３】', '達人珠【３】' ]
            };
            assert.deepEqual(got, exp);

            decos = util.filter(DECOS, [ '攻撃', '匠' ]);
            group = util._groupBySlot(decos);
            got = name(group);
            exp = {
                '1': [ '攻撃珠【１】' ],
                '2': [ '攻撃珠【２】', '匠珠【２】' ],
                '3': [ '攻撃珠【３】', '匠珠【３】' ]
            };
            assert.deepEqual(got, exp, '攻撃, 匠');
        });


        it('should group by correctly if null or etc', () => {
            let exp = { '1': [], '2': [], '3': [] };
            assert.deepEqual(util._groupBySlot(), exp);
            assert.deepEqual(util._groupBySlot(null), exp);
            assert.deepEqual(util._groupBySlot([]), exp);
        });
    });

    describe('combs()', () => {
        function name(decoCombs) {
            return decoCombs.map(decosList => {
                return decosList.map(decos => decos.map(deco => deco.name));
            });
        }

        it('should return combs', () => {
            let combs = util.combs(DECOS, [ '攻撃', '匠' ]);
            let got = name(combs);
            let exp = [
                [],
                [ [ '攻撃珠【１】' ] ],
                [ [ '攻撃珠【１】', '攻撃珠【１】' ],
                  [ '攻撃珠【２】' ], [ '匠珠【２】' ] ],
                [ [ '攻撃珠【１】', '攻撃珠【１】', '攻撃珠【１】' ],
                  [ '攻撃珠【２】', '攻撃珠【１】' ],
                  [ '匠珠【２】', '攻撃珠【１】' ],
                  [ '攻撃珠【３】' ], [ '匠珠【３】' ] ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return combs if decos are 1, 2, 3 slots', () => {
            // どちらも1, 2, 3スロある場合
            let combs = util.combs(DECOS, [ '攻撃', '達人' ]);
            let got = name(combs);
            let exp = [
                [],
                [ [ '攻撃珠【１】' ], [ '達人珠【１】' ] ],
                [ [ '攻撃珠【１】', '攻撃珠【１】' ],
                  [ '攻撃珠【１】', '達人珠【１】' ],
                  [ '達人珠【１】', '達人珠【１】' ],
                  [ '攻撃珠【２】' ], [ '達人珠【２】' ] ],
                [ [ '攻撃珠【１】', '攻撃珠【１】', '攻撃珠【１】' ],
                  [ '攻撃珠【１】', '攻撃珠【１】', '達人珠【１】' ],
                  [ '攻撃珠【１】', '達人珠【１】', '達人珠【１】' ],
                  [ '達人珠【１】', '達人珠【１】', '達人珠【１】' ],
                  [ '攻撃珠【２】', '攻撃珠【１】' ],
                  [ '攻撃珠【２】', '達人珠【１】' ],
                  [ '達人珠【２】', '攻撃珠【１】' ],
                  [ '達人珠【２】', '達人珠【１】' ],
                  [ '攻撃珠【３】' ], [ '達人珠【３】' ] ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return combs if decos are 1 slot only', () => {
            // 採取や高速収集みたく1スロしかない場合
            let combs = util.combs(DECOS, [ '採取', '高速収集' ]);
            let got = name(combs);
            let exp = [
                [],
                [ [ '採取珠【１】' ], [ '速集珠【１】' ] ],
                [ [ '採取珠【１】', '採取珠【１】' ],
                  [ '採取珠【１】', '速集珠【１】' ],
                  [ '速集珠【１】', '速集珠【１】' ] ],
                [ [ '採取珠【１】', '採取珠【１】', '採取珠【１】' ],
                  [ '採取珠【１】', '採取珠【１】', '速集珠【１】' ],
                  [ '採取珠【１】', '速集珠【１】', '速集珠【１】' ],
                  [ '速集珠【１】', '速集珠【１】', '速集珠【１】' ] ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return combs if contain torsoUp', () => {
            let combs = util.combs(DECOS, [ '攻撃', '胴系統倍加' ]);
            let got = name(combs);
            let exp = [
                [],
                [ [ '攻撃珠【１】' ] ],
                [ [ '攻撃珠【１】', '攻撃珠【１】' ], [ '攻撃珠【２】' ] ],
                [ [ '攻撃珠【１】', '攻撃珠【１】', '攻撃珠【１】' ],
                  [ '攻撃珠【２】', '攻撃珠【１】' ],
                  [ '攻撃珠【３】' ] ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return combs if decos are no 3 slot', () => {
            // 3スロを除いた装飾品が対象の場合
            let no3slot = DECOS.filter(deco => !deco.name.match(/【３】$/));

            let combs = util.combs(no3slot, [ '攻撃', '斬れ味' ]);
            let got = name(combs);
            let exp = [
                [],
                [ [ '攻撃珠【１】' ], [ '斬鉄珠【１】' ] ],
                [ [ '攻撃珠【１】', '攻撃珠【１】' ],
                  [ '攻撃珠【１】', '斬鉄珠【１】' ],
                  [ '斬鉄珠【１】', '斬鉄珠【１】' ],
                  [ '攻撃珠【２】' ] ],
                [ [ '攻撃珠【１】', '攻撃珠【１】', '攻撃珠【１】' ],
                  [ '攻撃珠【１】', '攻撃珠【１】', '斬鉄珠【１】' ],
                  [ '攻撃珠【１】', '斬鉄珠【１】', '斬鉄珠【１】' ],
                  [ '斬鉄珠【１】', '斬鉄珠【１】', '斬鉄珠【１】' ],
                  [ '攻撃珠【２】', '攻撃珠【１】' ],
                  [ '攻撃珠【２】', '斬鉄珠【１】' ] ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return combs if decos are no 1 slot', () => {
            // 1スロを除いた装飾品が対象の場合
            let no1slot = DECOS.filter(deco => !deco.name.match(/【１】$/));

            let combs = util.combs(no1slot, [ '攻撃', '匠' ]);
            let got = name(combs);
            let exp = [
                [],
                [],
                [ [ '攻撃珠【２】' ], [ '匠珠【２】' ] ],
                [ [ '攻撃珠【２】' ], [ '匠珠【２】' ],
                  [ '攻撃珠【３】' ], [ '匠珠【３】' ] ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return combs if none deco', () => {
            let nonedeco = []; // 装飾品なし
            let got = util.combs(nonedeco, [ '攻撃', '斬れ味' ]);
            let exp = [ [], [], [], [] ];
            assert.deepEqual(got, exp);
        });

        it('should return [] if null or etc', () => {
            assert.deepEqual(util.combs(), []);
            assert.deepEqual(util.combs(null), []);
            assert.deepEqual(util.combs([]), []);

            assert.deepEqual(util.combs([]), []);
            assert.deepEqual(util.combs([], null), []);
            assert.deepEqual(util.combs([], []), []);
        });
    });

    describe('skillsCombBySlot()', () => {
        it('should return skillsComb by slot', () => {
            let got = util.skillsCombBySlot(DECOS, [ '攻撃', '匠' ]);
            let exp = [
                [],
                [ { '攻撃': 1, '防御': -1 } ],
                [ { '攻撃': 2, '防御': -2 },
                  { '攻撃': 3, '防御': -1 },
                  { '匠': 1, '斬れ味': -1 } ],
                [ { '攻撃': 3, '防御': -3 },
                  { '攻撃': 4, '防御': -2 },
                  { '匠': 1, '斬れ味': -1, '攻撃': 1, '防御': -1 },
                  { '攻撃': 5, '防御': -1 },
                  { '匠': 2, '斬れ味': -2 } ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return skillsComb by slot if decos are 1, 2, 3 slot', () => {
            // どちらの装飾品も1, 2, 3スロある場合
            let got = util.skillsCombBySlot(DECOS, [ '攻撃', '達人' ]);
            let exp = [
                [],
                [ { '攻撃': 1, '防御': -1 }, { '達人': 1, '龍耐性': -1 } ],
                [ { '攻撃': 2, '防御': -2 },
                  { '攻撃': 1, '防御': -1, '達人': 1, '龍耐性': -1 },
                  { '達人': 2, '龍耐性': -2 },
                  { '攻撃': 3, '防御': -1 },
                  { '達人': 3, '龍耐性': -1 } ],
                [ { '攻撃': 3, '防御': -3 },
                  { '攻撃': 2, '防御': -2, '達人': 1, '龍耐性': -1 },
                  { '攻撃': 1, '防御': -1, '達人': 2, '龍耐性': -2 },
                  { '達人': 3, '龍耐性': -3 },
                  { '攻撃': 4, '防御': -2 },
                  { '攻撃': 3, '防御': -1, '達人': 1, '龍耐性': -1 },
                  { '達人': 3, '龍耐性': -1, '攻撃': 1, '防御': -1 },
                  { '達人': 4, '龍耐性': -2 },
                  { '攻撃': 5, '防御': -1 },
                  { '達人': 5, '龍耐性': -1 } ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return skillsComb by slot if conflict skills', () => {
            // 斬れ味と匠みたくプラスマイナスが反発するポイントの場合
            let got = util.skillsCombBySlot(DECOS, [ '斬れ味', '匠' ]);
            let exp = [
                [],
                [ { '斬れ味': 1, '匠': -1 } ],
                [ { '斬れ味': 2, '匠': -2 }, { '匠': 1, '斬れ味': -1 } ],
                [ { '斬れ味': 3, '匠': -3 },
                  { '匠': 0, '斬れ味': 0 },
                  { '匠': 2, '斬れ味': -2 },
                  { '斬れ味': 4, '匠': -2 } ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return skillsComb by slot if decos are 1 slot only', () => {
            // 採取や高速収集みたく1スロしかない場合
            let got = util.skillsCombBySlot(DECOS, [ '採取', '高速収集' ]);
            let exp = [
                [],
                [ { '採取': 2 }, { '高速収集': 2 } ],
                [ { '採取': 4 }, { '採取': 2, '高速収集': 2 }, { '高速収集': 4 } ],
                [ { '採取': 6 },
                  { '採取': 4, '高速収集': 2 },
                  { '採取': 2, '高速収集': 4 },
                  { '高速収集': 6 } ]
            ];
            assert.deepEqual(got, exp);
        });

        it('should return skillsComb by slot if none deco', () => {
            let nonedeco = [];
            let got = util.skillsCombBySlot(nonedeco, [ '攻撃', '斬れ味' ]);
            let exp = [ [], [], [], [] ];
            assert.deepEqual(got, exp);
        });

        it('should return skillsCombBySlot if null or etc', () => {
            assert.deepEqual(util.skillsCombBySlot(), []);
            assert.deepEqual(util.skillsCombBySlot(null), []);
            assert.deepEqual(util.skillsCombBySlot([]), []);

            assert.deepEqual(util.skillsCombBySlot([]), []);
            assert.deepEqual(util.skillsCombBySlot([], null), []);
            assert.deepEqual(util.skillsCombBySlot([], []), []);
        });
    });
});
