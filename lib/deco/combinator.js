'use strict';
const util = require('../util');

const parts = util.comb.parts; // parts 'body' is first

/**
 * 正規化された装飾品とスキルを元に、条件となるスキルの発動を満たす
 * 装飾品の組み合わせを求めるクラス。
 *
 *     let skillnames = [ '斬れ味レベル+1', '高級耳栓' ];
 *     let equip = {
 *         head  : ユクモノカサ・天,
 *         body  : 三眼の首飾り,
 *         arm   : ユクモノコテ・天,
 *         waist : バンギスコイル,
 *         leg   : ユクモノハカマ・天,
 *         weapon: slot2,
 *         charm : 龍の護石(スロ3,匠+4,氷耐性-5)
 *     };
 *     let n = new Normalizer(context);
 *     let bulksSet = n.normalize(skillnames, equip);
 *     let c = new Combinator(context);
 *     c.combine(skillnames, bulksSet, equip);
 *     => [
 *            { head  : { decos: [ '防音珠【１】' ], slot: 1, skills: {...} },
 *              body  : { decos: [ '防音珠【３】' ], slot: 3, skills: {...} },
 *              arm   : { decos: [ '防音珠【１】', '防音珠【１】' ], slot: 2, ... },
 *              waist : { decos: [], slot: 0, skills: { '胴系統倍加': 1, ... } },
 *              leg   : { decos: [ '防音珠【１】', '防音珠【１】' ], slot: 2, ...},
 *              weapon: { decos: [ '防音珠【１】', '防音珠【１】' ], slot: 2, ... },
 *              charm : { decos: [ '匠珠【３】' ], slot: 3, skills: {...} } },
 *            ...
 *     ]
 *
 * データについて
 * * decomb  スキルが発動する装飾品の組み合わせ
 *   e.g.
 *       { head  : { decos: [ '防音珠【１】' ], slot: 1, skills: {...} },
 *         body  : { decos: [ '防音珠【３】' ], slot: 3, skills: {...} },
 *         arm   : { decos: [ '防音珠【１】', '防音珠【１】' ], slot: 2, ... },
 *         waist : { decos: [], slot: 0, skills: { '胴系統倍加': 1, ... } },
 *         leg   : { decos: [ '防音珠【１】', '防音珠【１】' ], slot: 2, ...},
 *         weapon: { decos: [ '防音珠【１】', '防音珠【１】' ], slot: 2, ... },
 *         charm : { decos: [ '匠珠【３】' ], slot: 3, skills: {...} } }
 *
 * * decombs  decomb の配列
 *   e.g.
 *       [ decomb1, decomb2, ... ]
 */
class Combinator {
    constructor(context) {
        if (context == null) throw new Error('context is required');
        this.context = context;
    }

    /**
     * 正規化された装飾品とスキルを元に、条件となるスキルの発動を満たす
     * 装飾品の組み合わせを返す。
     */
    combine(skillnames, bulksSet, equip) {
        if (skillnames == null || skillnames.length === 0) return [];
        if (bulksSet == null || bulksSet.body == null) return [];

        let equipSkills = util.skill.unify(equip);
        let borderLine = new util.BorderLine(this.context, skillnames, bulksSet, equipSkills);

        let combs = this._combine(bulksSet, borderLine);

        let decombs = this._brushUp(combs);

        decombs = this._removeOverlap(decombs);

        let totalSlot = this._calcTotalSlot(equip);
        decombs = this._removePointOver(decombs, totalSlot, borderLine.goal);

        return decombs;
    }

    /**
     * 装飾品の組み合わせを求める。
     *
     * bulksSet の bulks は、スロット数の昇順でソート済みの前提。
     */
    _combine(bulksSet, borderLine) {
        let combs = [ { decombs: [], sumSkills: {} } ];
        let activated = [];

        // 装飾品無しでスキルが発動してるか
        activated = this._filter(combs, borderLine.goal);
        if (activated.length) return activated;

        for (let i = 0, ilen = parts.length; i < ilen; ++i) {
            let part = parts[i];
            let bulks = bulksSet[part];

            let seen = [];
            for (let j = 0, jlen = combs.length; j < jlen; ++j) {
                let comb = combs[j];
                let newCombs = this._combineDeco(comb, bulks, borderLine, part);
                seen = seen.concat(newCombs);
            }

            combs = this._compress(seen);

            activated = this._filter(combs, borderLine.goal);
            if (activated.length) break;
        }

        return activated;
    }

    _combineDeco(comb, bulks, borderLine, part) {
        let ret = [];

        if (bulks == null || bulks.length === 0) {
            bulks = [ { skills: {} } ];
        }

        let blSum = borderLine.calcSum(part, comb.sumSkills);
        let blEach = borderLine.calcEach(part, comb.sumSkills);

        for (let i = 0, len = bulks.length; i < len; ++i) {
            let bulk = bulks[i];
            let skills = bulk.skills;

            if (util.skill.hasTorsoUp(skills)) {
                let combs = this._combineTorsoUp(comb, bulk, borderLine, part);
                ret = ret.concat(combs);
                continue;
            }

            let isOverSum = util.skill.sum(skills) >= blSum;
            let isOverEach = util.comb.isOver(blEach, skills);

            if (!isOverSum || !isOverEach) continue;

            ret.push(this._newComb(comb, bulk, part));
        }

        return ret;
    }

    _combineTorsoUp (comb, bulk, borderLine, part) {
        let ret = [];

        let blSum = borderLine.calcSum(part, comb.sumSkills);
        let blEach = borderLine.calcEach(part, comb.sumSkills);

        for (let i = 0, len = comb.decombs.length; i < len; ++i) {
            let decomb = comb.decombs[i];
            let bodySkills = decomb.body.skills || {};

            let isOverSum  = util.skill.sum(bodySkills) >= blSum;
            let isOverEach = util.comb.isOver(blEach, bodySkills);

            if (!isOverSum || !isOverEach) continue;

            let newComb = {
                decombs: [ this._newDecomb(decomb, bulk, part) ],
                sumSkills: util.skill.merge(comb.sumSkills, bodySkills)
            };
            ret.push(newComb);
        }

        return ret;
    }

    _newComb(comb, bulk, part) {
        comb = comb || { decombs: [], sumSkills: null };
        bulk = bulk || {};

        let srcDecombs = comb.decombs;
        if (srcDecombs.length === 0) srcDecombs = [ {} ];

        let decombs = [];
        for (let i = 0, len = srcDecombs.length; i < len; ++i) {
            let src = srcDecombs[i];
            let decomb = this._newDecomb(src, bulk, part);
            decombs.push(decomb);
        }

        return {
            decombs: decombs,
            sumSkills: util.skill.merge(comb.sumSkills, bulk.skills)
        };
    }

    _newDecomb(decomb, bulk, part) {
        let ret = Object.assign({}, decomb);

        ret[part] = {
            decos: bulk.decos || [],
            slot : bulk.slot || 0,
            skills: bulk.skills || {}
        };

        return ret;
    }

    /**
     * combs を圧縮する。
     *
     * 以下の処理をすることで圧縮する。
     * + combs を comb の sumSkills でユニークにすることで数を減らす
     * + ユニークにする際、decombs をまとめる
     */
    _compress(combs) {
        let bucket = {};

        for (let i = 0, len = combs.length; i < len; ++i) {
            let comb = combs[i];

            let key = genKey(comb);
            if (bucket[key] == null) {
                bucket[key] = comb;
                continue;
            }

            // decombs をまとめる
            bucket[key].decombs = bucket[key].decombs.concat(comb.decombs);
        }

        let ret = [];
        for (let key in bucket) ret.push(bucket[key]);

        return ret;
    }

    _filter(combs, goal) {
        let ret = [];
        for (let i = 0, len = combs.length; i < len; ++i) {
            let comb = combs[i];
            if (!util.comb.activates(comb.sumSkills, goal)) continue;
            ret.push(comb);
        }
        return ret;
    }

    _brushUp(combs) {
        let decombs = [];

        for (let i = 0, ilen = combs.length; i < ilen; ++i) {
            decombs = decombs.concat(combs[i].decombs);
        }

        let ret = [];
        for (let i = 0, ilen = decombs.length; i < ilen; ++i) {
            let decomb  = decombs[i];
            let brushed = {};
            for (let j = 0, jlen = parts.length; j < jlen; ++j) {
                let part = parts[j];
                brushed[part] = decomb[part] || { decos: [], slot: 0, skills: {} };
            }
            ret.push(brushed);
        }
        return ret;
    }

    /**
     * 装飾品の組み合わせがかぶってるものを削除
     */
    _removeOverlap(decombs) {
        let ret = [];

        let bucket = {};
        for (let i = 0, len = decombs.length; i < len; ++i) {
            let decomb = decombs[i];

            let names = [];
            for (let part in decomb) {
                let comb = decomb[part];
                if (comb == null) continue;
                names = names.concat(comb.decos);
            }

            let key = names.sort().join(',');
            if (bucket[key]) continue;

            ret.push(decomb);
            bucket[key] = true;
        }

        return ret;
    }

    _calcTotalSlot(equip) {
        let total = 0;
        for (let part in equip) {
            let eq = equip[part];
            if (eq == null) continue;
            total += eq.slot;
        }
        return total;
    }

    _removePointOver(decombs, totalSlot, goal) {
        let groupBy = this._groupByFreeSlot(decombs, totalSlot);

        let list = [];
        for (let freeSlot in groupBy) list.push(freeSlot);
        list = list.sort().reverse();

        let ret = [];
        for (let i = 0, len = list.length; i < len; ++i) {
            let freeSlot = list[i];
            let combs = groupBy[freeSlot];
            let just = this._getJustActivated(combs, goal);

            // ちょうどスキルが発動してるのがなかったら全部を結果に
            if (just.length === 0) just = combs;

            ret = ret.concat(just);
        }

        return ret;
    }

    _groupByFreeSlot(decombs, totalSlot) {
        let ret = {};
        for (let i = 0, len = decombs.length; i < len; ++i) {
            let decomb = decombs[i];
            let usedSlot = 0;
            for (let part in decomb) {
                let comb = decomb[part];
                if (comb == null) continue;
                usedSlot += comb.slot;
            }
            let freeSlot = totalSlot - usedSlot;
            if (ret[freeSlot] == null) ret[freeSlot] = [];
            ret[freeSlot].push(decomb);
        }
        return ret;
    }

    /**
     * スキルがちょうど発動している装飾品の組み合わせを返す。
     */
    _getJustActivated(decombs, goal) {
        let ret = [];
        for (let i = 0, len = decombs.length; i < len; ++i) {
            let decomb = decombs[i];
            let skills = util.skill.unify(decomb);
            if (util.comb.justActivates(skills, goal)) ret.push(decomb);
        }
        return ret;
    }
}

function genKey(comb) {
    let sumSkills = comb.sumSkills || {};
    let sumTrees = Object.keys(sumSkills).sort();

    let list = [];
    for (let i = 0, len = sumTrees.length; i < len; ++i) {
        let tree = sumTrees[i];
        list.push(tree, sumSkills[tree]);
    }

    return list.join();
}

module.exports = Combinator;
