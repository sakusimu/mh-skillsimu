'use strict';
const util = require('../util');

/**
 * 発動条件を満たす装備の組み合わせを元に、装備を組み立てるクラス。
 *
 *     let a = new Assembler(context);
 *     let eqcombs = [
 *         { head  : [ 'head1a', 'head1b' ],
 *           body  : [ 'body1' ],
 *           arm   : [ 'arm1' ],
 *           waist : [ 'waist1' ],
 *           leg   : [ 'leg1' ],
 *           weapon: [ 'weapon1' ],
 *           charm : [ 'charm1' ] },
 *         { head  : [ 'head2' ],
 *           body  : [ 'body2' ],
 *           arm   : [ 'arm2' ],
 *           waist : [ 'waist2' ],
 *           leg   : [ 'leg2' ],
 *           weapon: [],
 *           charm : [ 'charm2a', 'charm2b' ] }
 *     ];
 *     a.assebleEquip(eqcombs);
 *     => [
 *            { head  : 'head1a',
 *              body  : 'body1',
 *              arm   : 'arm1',
 *              waist : 'waist1',
 *              leg   : 'leg1',
 *              weapon: 'weapon1',
 *              charm : 'charm1' },
 *            { head  : 'head1b',
 *              body  : 'body1',
 *              arm   : 'arm1',
 *              waist : 'waist1',
 *              leg   : 'leg1',
 *              weapon: 'weapon1',
 *              charm : 'charm1' },
 *            { head  : 'head2',
 *              body  : 'body2',
 *              arm   : 'arm2',
 *              waist : 'waist2',
 *              leg   : 'leg2',
 *              weapon: null,
 *              charm : 'charm2a' },
 *            { head  : 'head2',
 *              body  : 'body2',
 *              arm   : 'arm2',
 *              leg   : 'leg2',
 *              waist : 'waist2',
 *              weapon: null,
 *              charm : 'charm2b' }
 *        ]
 *
 * データについて
 * * assem  スキルが発動する装備のセット
 *   e.g.
 *     { head: 'head1', body: 'body1', arm: 'arm1', waist: 'waist1', leg: 'leg1',
 *       weapon: 'weapon1', charm: 'charm1' }
 */
class Assembler {
    constructor(context) {
        if (context == null) throw new Error('context is required');
        this.context = context;
        this.threshold = 9999; // 組み合わせ数がこの閾値を超えたら打ち切り
    }

    /**
     * 発動条件を満たす装備の組み合わせを元に、装備を組み立てて返す。
     */
    assemble(eqcombs) {
        if (eqcombs == null || eqcombs.length === 0) return [];

        let assems = [];
        let cache = {};

        for (let i = 0, len = eqcombs.length; i < len; ++i) {
            let comb = eqcombs[i];
            assems = assems.concat(this._assemble(comb, cache));

            if (assems.length > this.threshold) {
                assems = assems.slice(0, this.threshold);
                break;
            }
        }

        let ret = [];
        for (let i = 0, ilen = assems.length; i < ilen; ++i) {
            let assem = assems[i];
            let equip = {};
            for (let j = 0, jlen = parts.length; j < jlen; ++j) {
                let part = parts[j];
                equip[part] = assem[j];
            }
            ret.push(equip);
        }

        return ret;
    }

    /**
     * 発動条件を満たす装備を組み立てて返す。
     * cache が指定されたら、cache 利用してユニークにしながら組み立てる。
     */
    _assemble(eqcomb, cache) {
        let assems = [ [] ];
        for (let i = 0, ilen = parts.length; i < ilen; ++i) {
            let part  = parts[i];
            let names = eqcomb[part];
            let num   = names.length;
            let list  = [];

            for (let j = 0, jlen = assems.length; j < jlen; ++j) {
                let assem = assems[j];
                let expanded = [];
                if (num === 0) expanded.push(assem.concat(null));
                for (let k = 0; k < num; ++k) {
                    expanded.push(assem.concat(names[k]));
                }
                list = list.concat(expanded);
            }
            assems = list;
        }

        if (cache == null) return assems;

        let ret = [];
        for (let i = 0, ilen = assems.length; i < ilen; ++i) {
            let assem = assems[i];
            let key = genKey(assem);
            if (cache[key]) continue;
            cache[key] = true;
            ret.push(assem);
        }

        return ret;
    }
}

const parts = util.parts; // alias

function genKey(assem) { return assem.join(); }

module.exports = Assembler;
