'use strict';
const assert = require('power-assert');
const Normalizer = require('../../../lib/equip/normalizer');
const Context = require('../../../lib/context');

describe('equip/normalizer', () => {
    let context = new Context();

    describe('constructor()', () => {
        it('should create normalizer', () => {
            let n = new Normalizer(context);
            assert(n);
            assert(n.context === context);
        });

        it('should throw exception if no arguments', () => {
            let got;
            try { new Normalizer(); } catch (e) { got = e.message; }
            assert(got === 'context is required');
        });
    });

    describe('_compareAny()', () => {
        let n = new Normalizer(context);
        let src, dst;

        it('should compare correctly', () => {
            src = { a: 1 }; dst = { a: 1 };
            assert(n._compareAny(src, dst) === false, 'src equal dst');
            src = { a: 1 }; dst = { a: 2 };
            assert(n._compareAny(src, dst) === true, 'src < dst');
            src = { a: 2 }; dst = { a: 1 };
            assert(n._compareAny(src, dst) === false, 'src > dst');
        });

        it('should compare correctly if with minus', () => {
            src = { a: -1 }; dst = { a: 1 };
            assert(n._compareAny(src, dst) === true, 'src < dst');
            src = { a: 1 }; dst = { a: -1 };
            assert(n._compareAny(src, dst) === false, 'src > dst');

            src = { a: -1 }; dst = { a: 0 };
            assert(n._compareAny(src, dst) === true, 'src < dst: with zero');
            src = { a: 0 }; dst = { a: -1 };
            assert(n._compareAny(src, dst) === false, 'src > dst: with zero');
        });

        it('should compare correctly if with multi skills', () => {
            src = { a: 1, b: 0 }; dst = { a: 1, b: 0 };
            assert(n._compareAny(src, dst) === false, 'src equal dst');
            src = { a: 1, b: 1 }; dst = { a: 1, b: 2 };
            assert(n._compareAny(src, dst) === true, 'src < dst');
            src = { a: 1, b: 2 }; dst = { a: 1, b: 1 };
            assert(n._compareAny(src, dst) === false, 'src > dst');
        });

        it('should compare correctly', () => {
            src = { a: 1, b: 1 }; dst = { a: 0, b: 2 };
            assert(n._compareAny(src, dst) === true, 'src < dst');
            src = { a: 0, b: 2 }; dst = { a: 1, b: 1 };
            assert(n._compareAny(src, dst) === true, 'src < dst');

            src = { a: 0, b: 0 }; dst = { a: -1, b: 1 };
            assert(n._compareAny(src, dst) === true, 'with minus');
            src = { a: -1, b: 1 }; dst = { a: 0, b: 0 };
            assert(n._compareAny(src, dst) === true, 'with minus');

            src = { a: 2, b: 1, c: 0 }; dst = { a: 1, b: 1, c: 1 };
            assert(n._compareAny(src, dst) === true, 'multi skills');
            src = { a: 1, b: 1, c: 1 }; dst = { a: 2, b: 1, c: 0 };
            assert(n._compareAny(src, dst) === true, 'multi skills 2');
        });
    });

    describe('_collectMaxSkill()', () => {
        let n = new Normalizer(context);

        it('should collect max skill', () => {
            let combs = [ { a: 1 } ];
            let got = n._collectMaxSkill(combs);
            let exp = [ { a: 1 } ];
            assert.deepEqual(got, exp, 'equal 1');

            combs = [ { a: 1 }, { a: 2 } ];
            got = n._collectMaxSkill(combs);
            exp = [ { a: 2 } ];
            assert.deepEqual(got, exp, 'equal 2');

            combs = [ { a: 1, b: 1 }, { a: 2, b: 1 } ];
            got = n._collectMaxSkill(combs);
            exp = [ { a: 2, b: 1 } ];
            assert.deepEqual(got, exp, 'collect max');

            combs = [ { a: 1, b: -3 }, { a: 1, b: -1 }, { a: -1, b: 0 } ];
            got = n._collectMaxSkill(combs);
            exp = [ { a: 1, b: -1 }, { a: -1, b: 0 } ];
            assert.deepEqual(got, exp, 'collect max: minus & 0');

            combs = [ { a: 1, b: 1, c: 0 }, { a: 2, b: 1, c: 0 },
                      { a: 1, b: 1, c: 1 },
                      { a: 0, b: 2, c: 1 }, { a: 0, b: 1, c: 1 } ];
            got = n._collectMaxSkill(combs);
            exp = [ { a: 2, b: 1, c: 0 }, { a: 1, b: 1, c: 1 }, { a: 0, b: 2, c: 1 } ];
            assert.deepEqual(got, exp, 'collect max: complex');
        });

        it('should not collect correctly if contain same combs', () => {
            let combs = [ { a: 2, b: 0 }, { a: 1, b: 1 }, { a: 2, b: 0 } ];
            let got = n._collectMaxSkill(combs);
            let exp = [ { a: 1, b: 1 } ];
            //exp = [ { a: 2, b: 0 }, { a: 1, b: 1 } ]; // ホントの正しい結果はこれ
            assert.deepEqual(got, exp, 'not uniq');
        });
    });
});
