'use strict';
const assert = require('power-assert');
const util = require('../../../lib/util/skill');
const myapp = require('../../support/lib/driver-myapp');

describe('util/skill', () => {
    beforeEach(() => { myapp.initialize(); });

    describe('isTorsoUp()', () => {
        it('should return true or false correctly', () => {
            assert(util.isTorsoUp('胴系統倍加'));
            assert(util.isTorsoUp('胴系統倍化'));

            assert(util.isTorsoUp('攻撃') === false);
            assert(util.isTorsoUp('') === false);

            assert(util.isTorsoUp() === false);
            assert(util.isTorsoUp(null) === false);
        });
    });

    describe('hasTorsoUp()', () => {
        it('should return true or false correctly', () => {
            assert(util.hasTorsoUp({ '胴系統倍加': 1 }));
            assert(util.hasTorsoUp({ '胴系統倍化': 1 }));

            assert(util.hasTorsoUp({ '攻撃': 4 }) === false, '攻撃');
            assert(util.hasTorsoUp({ '': 4 }) === false);

            assert(util.hasTorsoUp() === false);
            assert(util.hasTorsoUp(null) === false);
            assert(util.hasTorsoUp({}) === false);
        });
    });

    describe('compact()', () => {
        it('should compact correctly', () => {
            let got = util.compact([ 'a' ], { a: 1, b: 2 });
            let exp = { a: 1 };
            assert.deepEqual(got, exp);
            got = util.compact([ 'b' ], { a: 1 });
            exp = { b: 0 };
            assert.deepEqual(got, exp);
            got = util.compact([ 'a', 'c' ], { a: 1, b: 2 });
            exp = { a: 1, c: 0 };
            assert.deepEqual(got, exp);

            got = util.compact([ 'a', 'c' ], { b: 1, c: -1 });
            exp = { a: 0, c: -1 };
            assert.deepEqual(got, exp);

            got = util.compact([ 'a' ], {});
            exp = { a: 0 };
            assert.deepEqual(got, exp);
            got = util.compact([ 'a' ], null);
            exp = { 'a': 0 };
            assert.deepEqual(got, exp);

            got = util.compact([], { a: 1, b: 2 });
            exp = {};
            assert.deepEqual(got, exp);
            got = util.compact(null, { a: 1, b: 2 });
            exp = {};
            assert.deepEqual(got, exp);
            got = util.compact(null, null);
            exp = {};
            assert.deepEqual(got, exp);
        });

        it('should compact correctly if contain torsoUp', () => {
            let got = util.compact([ 'a' ], { a: 1, b: 2, '胴系統倍加': 1 });
            let exp = { a: 1, '胴系統倍加': 1 };
            assert.deepEqual(got, exp);
            got = util.compact([ 'a' ], { '胴系統倍加': 1 });
            exp = { a: 0, '胴系統倍加': 1 };
            assert.deepEqual(got, exp);
            got = util.compact([], { '胴系統倍加': 1 });
            exp = { '胴系統倍加': 1 };
            assert.deepEqual(got, exp);
        });

        it('should compact correctly if specify skillCombs', () => {
            let got = util.compact([ 'a' ], [ { a: 1, b: 2 }, { a: 2, b: 1 } ]);
            let exp = [ { a: 1 }, { a: 2 } ];
            assert.deepEqual(got, exp);
            got = util.compact([ 'b' ], [ { a: 1 }, null ]);
            exp = [ { b: 0 }, { b: 0 } ];
            assert.deepEqual(got, exp);
            got = util.compact([ 'a', 'c' ], [ { a: 1, b: 2 }, { '胴系統倍加': 1 } ]);
            exp = [ { a: 1, c: 0 }, { a: 0, c: 0, '胴系統倍加': 1 } ];
            assert.deepEqual(got, exp);
            got = util.compact([ 'a' ], []);
            exp = [ { a: 0 } ];
            assert.deepEqual(got, exp);
        });
    });

    describe('contains()', () => {
        it('should return true or false correctly', () => {
            let sc = { '体力': -2, '回復速度': 2, '乗り': 3 }; // ブレイブベスト
            assert(util.contains(sc, '乗り'));
            assert(util.contains(sc, [ '乗り' ]));

            sc = { '攻撃': 2, '火属性攻撃': 2, '回復量': -2 }; // レウスメイル
            assert(util.contains(sc, [ '攻撃', '火属性攻撃' ]));
            assert(util.contains(sc, [ '攻撃', '匠' ]));
            assert(util.contains(sc, [ '達人', '匠' ]) === false);
        });
    });

    describe('isEqual()', () => {
        let a, b;

        it('should return true or false correctly', () => {
            a = { a: 1 }; b = { a: 1 };
            assert(util.isEqual(a, b));
            a = { a: 1 }; b = { a: 2 };
            assert(util.isEqual(a, b) === false);
            a = { a: 1 }; b = { a: 0 };
            assert(util.isEqual(a, b) === false);
        });

        it('should return true or false correctly if contain 2 skills', () => {
            a = { a: 1, b: 0 }; b = { a: 1, b: 0 };
            assert(util.isEqual(a, b));
            a = { a: 1, b: 1 }; b = { a: 1, b: 2 };
            assert(util.isEqual(a, b) === false);
            a = { a: 1, b: 1 }; b = { a: 1, b: 0 };
            assert(util.isEqual(a, b) === false);
        });

        it('should return true or false correctly if contain many skills', () => {
            a = { a: 3, b: 2, c: 1, d: 0 }; b = { a: 3, b: 2, c: 1, d: 0 };
            assert(util.isEqual(a, b));
            a = { a: 3, b: 2, c: 1, d: 0 }; b = { a: 3, b: 2, c: 2, d: 0 };
            assert(util.isEqual(a, b) === false);
        });

        it('should return uncorrectly if not contain same skills', () => {
            // 同じプロパティでないと正しい結果が返らない
            a = { a: 1 }; b = { b: 1 };
            assert(util.isEqual(a, b) === false);
            a = { a: 1 }; b = { a: 1, b: 1 };
            assert(util.isEqual(a, b));
        });
    });

    describe('join()', () => {
        it('should join', () => {
            let got = util.join([ { a: 1 } ]);
            let exp = { a: 1 };
            assert.deepEqual(got, exp);

            got = util.join([ null ]);
            exp = {};
            assert.deepEqual(got, exp);

            got = util.join([ { a: 1, b: -1 }, { a: 1 } ]);
            exp = { a: 2, b: -1 };
            assert.deepEqual(got, exp, 'add');
            got = util.join([ { a: 1, b: -1 }, { b: -1 } ]);
            exp = { a: 1, b: -2 };
            assert.deepEqual(got, exp, 'remove');
        });

        it('should join stably', () => {
            let combs = [ { a: 1, b: -1 }, { c: 1, d: -1 } ];

            let got = util.join(combs);
            let exp = { a: 1, c: 1, b: -1, d: -1 };
            assert.deepEqual(got, exp);

            got = combs;
            exp = [ { a: 1, b: -1 }, { c: 1, d: -1 } ];
            assert.deepEqual(got, exp, 'stable');
        });

        it('should join if contain torsoUp', () => {
            let got = util.join([ { a: 1, '胴系統倍加': 1 }, { a: 1 } ]);
            let exp = { a: 2, '胴系統倍加': 1 };
            assert.deepEqual(got, exp);
            got = util.join([ { a: 1, b: -1 }, { '胴系統倍加': 1 } ]);
            exp = { a: 1, b: -1, '胴系統倍加': 1 };
            assert.deepEqual(got, exp);
            got = util.join([ { a: 1, '胴系統倍加': 1 }, { '胴系統倍加': 1 } ]);
            exp = { a: 1, '胴系統倍加': 1 };
            assert.deepEqual(got, exp);
        });

        it('should join if contain null or etc', () => {
            let got = util.join([ { a: 1 }, undefined ]);
            let exp = { a: 1 };
            assert.deepEqual(got, exp);
            got = util.join([ { a: 1 }, null ]);
            exp = { a: 1 };
            assert.deepEqual(got, exp);
            got = util.join([ { a: 1 }, {} ]);
            exp = { a: 1 };
            assert.deepEqual(got, exp);
        });

        it('should join if null or etc', () => {
            assert.deepEqual(util.join(), {});
            assert.deepEqual(util.join(null), {});
            assert.deepEqual(util.join([]), {});
        });
    });

    describe('merge()', () => {
        it('should merge', () => {
            let got = util.merge({ a: 1, b: -1 }, { a: 1 });
            let exp = { a: 2, b: -1 };
            assert.deepEqual(got, exp, 'add');
            got = util.merge({ a: 1, b: -1 }, { b: -1 });
            exp = { a: 1, b: -2 };
            assert.deepEqual(got, exp, 'remove');
        });
    });

    describe('sum()', () => {
        it('should sum', () => {
            assert(util.sum({ a: 1, b: 1 }) === 2);
            assert(util.sum({ a: 3, b: 1 }) === 4);
            assert(util.sum({ a: 1, b: 2 }) === 3);

            assert(util.sum({ a: -3, b: 1 }) === -2);
            assert(util.sum({ a: 1, b: -2 }) === -1);

            assert(util.sum({ a: 0, b: 0 }) === 0);
            assert(util.sum({ a: 1, b: 0 }) === 1);

            assert(util.sum({ a: 0, b: 1 }) === 1);

            assert(util.sum({ a: 1, b: 1, 'c': 1, 'd': 1, 'e': 1 }) === 5);
        });

        it('should sum except torsoUp', () => {
            assert(util.sum({ a: 1, b: 1, '胴系統倍加': 1, 'c': 1 }) === 3);
        });

        it('should sum if null or etc', () => {
            assert(util.sum() === 0);
            assert(util.sum(null) === 0);
            assert(util.sum({}) === 0);
            assert(util.sum([]) === 0);
        });
    });

    describe('trees()', () => {
        it('should return trees', () => {
            let got = util.trees([ '攻撃力UP【大】', '斬れ味レベル+1', '耳栓' ]);
            let exp = [ '攻撃', '匠', '聴覚保護' ];
            assert.deepEqual(got, exp);
        });

        it('should throw exception if tree not found', () => {
            let got;
            try { util.trees([ '攻撃大' ]); } catch (e) { got = e.message; }
            assert(got === '攻撃大 is not found');
        });
    });

    describe('unify()', () => {
        it('should unify set', () => {
            let set = {
                head: { skillComb: { a: 1 } },
                body: { skillComb: { a: 1, b: 1 } },
                arm: { skillComb: { b: 1 } },
                waist: { skillComb: { '胴系統倍加': 1 } },
                leg: { skillComb: { c: 1 } },
                weapon: {},
                oma: null
            };
            let got = util.unify(set);
            let exp = { a: 3, b: 3, c: 1 };
            assert.deepEqual(got, exp);
        });

        it('should unify set if body is null', () => {
            let set = {
                head: { skillComb: { a: 1 } },
                body: null,
                arm: { skillComb: { b: 1 } },
                waist: { skillComb: { '胴系統倍加': 1 } },
                leg: { skillComb: { c: 1 } },
                weapon: {},
                oma: null
            };
            let got = util.unify(set);
            let exp = { a: 1, b: 1, c: 1 };
            assert.deepEqual(got, exp);
        });

        it('should unify list', () => {
            let list = [
                { skillComb: { a: 1, b: 1 } },
                { skillComb: { a: 1 } },
                { skillComb: { b: 1 } },
                { skillComb: { '胴系統倍加': 1 } },
                { skillComb: { c: 1 } },
                {},
                null
            ];
            let got = util.unify(list);
            let exp = { a: 3, b: 3, c: 1};
            assert.deepEqual(got, exp);
        });

        it('should unify list if body is null', () => {
            let list = [
                null,
                { skillComb: { a: 1 } },
                { skillComb: { b: 1 } },
                { skillComb: { '胴系統倍加': 1 } },
                { skillComb: { c: 1 } },
                {},
                null
            ];
            let got = util.unify(list);
            let exp = { a: 1, b: 1, c: 1 };
            assert.deepEqual(got, exp);
        });
    });
});