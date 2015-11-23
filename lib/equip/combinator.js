'use strict';
const util = require('../util');

const parts = util.comb.parts; // parts 'body' is first

/**
 * 正規化された装備とスキルを元に、条件となるスキルが発動する
 * 装備の組み合わせを求めるクラス。
 *
 * 頑シミュさんの "高速化２「打ち切る」" をしながら組み合わせを求める。
 * (cf. http://www.geocities.jp/masax_mh/logic/page5_speed2.html)
 *
 *     let c = new Combinator(context);
 *     // bulksSet: Normalizer で normalize([ '攻撃力UP【大】', '業物' ]) した結果
 *     c.combine([ '攻撃力UP【大】', '業物' ], bulksSet);
 *     => [
 *            { body: [ 'シルバーソルメイル' ],
 *              head: [ 'レウスＳキャップ' ],
 *              arm: [ 'グリードアーム' ],
 *              waist: [ 'ガブラスーツベルト','クロムメタルコイル','ガブラスーツＳベルト',
 *                       'バンギスコイル','グリードフォールド','ゾディアスコイル' ],
 *              leg: [ 'バンギスグリーヴ' ],
 *              weapon: [],
 *              charm: [] }
 *            { body: [ 'シルバーソルメイル' ],
 *              head: [ 'レウスＳキャップ' ],
 *              arm: [ 'グリードアーム' ],
 *              waist: [ 'ジンオウＳフォールド' ],
 *              leg: [ 'バンギスグリーヴ' ],
 *              weapon: [],
 *              charm: [] }
 *            { body: [ 'グリードメイル' ],
 *              head: [ 'レウスＳキャップ' ],
 *              arm: [ 'クロオビアーム', '伝説Ｊグラブ', 'ゾディアスアーム' ],
 *              waist: [ 'ジンオウＳフォールド' ],
 *              leg: [ 'バンギスグリーヴ' ],
 *              weapon: [],
 *              charm: [] }
 *            ...
 *        ]
 *
 * データについて
 * * eqcomb  スキルが発動する装備の組み合わせ
 *   e.g.
 *       { head: [ 'head1', 'head2', ... ], body: [ 'body1', ... ], ... }
 *
 * * eqcombs  eqcomb の配列
 *   e.g.
 *       [ eqcomb1, eqcomb2, ... ]
 */
class Combinator {
    constructor(context) {
        if (context == null) throw new Error('context is required');
        this.context = context;
        this.threshold = 0; // 組み合わせ数がこの閾値を超えたら打ち切り(0 は打ち切りなし)
    }

    /**
     * 正規化された装備とスキルを元に、条件となるスキルが発動する
     * 装備の組み合わせを返す。
     */
    combine(skillnames, bulksSet) {
        if (skillnames == null || skillnames.length === 0) return [];
        if (bulksSet == null || bulksSet.body == null) return [];

        for (let part in bulksSet) {
            if (bulksSet[part] == null) continue;
            bulksSet[part] = this._sortBulks(bulksSet[part]);
        }

        let combs = this._combineUsedSp0(skillnames, bulksSet);
        let eqcombs = this._brushUp(combs);

        if (eqcombs.length) return eqcombs;

        combs = this._combine(skillnames, bulksSet);
        eqcombs = this._brushUp(combs);

        return eqcombs;
    }

    /**
     * bulks を、スキルポイントの合計の降順でソートする。
     * (ただし、胴系統倍加は先頭にする)
     */
    _sortBulks(bulks) {
        // 合計ポイントでスキルをまとめる
        let buckets = {};
        for (let i = 0, len = bulks.length; i < len; ++i) {
            let bulk = bulks[i];
            let sum = util.skill.sum(bulk.skills);
            if (buckets[sum] == null) buckets[sum] = [];
            buckets[sum].push(bulk);
        }

        // 胴系統倍加があったら、まず追加する処理
        // (胴系統倍加は、合計ポイントが 0 になるので、最初に if で絞ってる)
        let ret = [];
        if (buckets[0] != null) {
            let sum0Bulks = buckets[0];
            let torsoUpBulk;
            for (let i = sum0Bulks.length - 1; 0 <= i; --i) {
                let bulk = sum0Bulks[i];
                if (util.skill.hasTorsoUp(bulk.skills)) {
                    torsoUpBulk = sum0Bulks.splice(i, 1);
                    break;
                }
            }
            if (torsoUpBulk) ret = ret.concat(torsoUpBulk);
        }

        let sums = Object.keys(buckets).sort((a, b) => b - a);
        for (let i = 0, len = sums.length; i < len; ++i) {
            let sum = sums[i];
            ret = ret.concat(buckets[sum]);
        }

        return ret;
    }

    /**
     * 装備なし(=スキルポイントが 0)を使った組み合わせを求める。
     */
    _combineUsedSp0(skillnames, bulksSet) {
        let bulksSets = this._makeBulksSetWithSp0(bulksSet);

        let ret = [];
        for (let i = 0, len = bulksSets.length; i < len; ++i) {
            let combs = this._combine(skillnames, bulksSets[i]);
            ret = ret.concat(combs);

            if (ret.length) return ret;
        }

        return ret;
    }

    // _sortBulks されてる前提
    _makeBulksSetWithSp0(bulksSet) {
        // sp0(= Skill Point 0) を含む bulk を見つける
        let sp0Set = {};
        for (let part in bulksSet) {
            let bulks = bulksSet[part];
            if (bulks == null) continue;

            for (let i = 0, len = bulks.length; i < len; ++i) {
                let bulk = bulks[i];
                if (util.skill.hasTorsoUp(bulk.skills)) continue;

                let sum = util.skill.sum(bulk.skills);
                if (sum === 0) {
                    sp0Set[part] = bulk;
                    break;
                }
            }
        }

        let sp0Parts = Object.keys(sp0Set);
        if (sp0Parts.length === 0) return [];

        // sp0 を使った組み合わせ
        let bulksSets = [];
        for (let part in sp0Set) {
            let set = {};
            set[part] = [ sp0Set[part] ];
            for (let i = 0, len = parts.length; i < len; ++i) {
                if (part === parts[i]) continue;
                let restPart = parts[i];
                set[restPart] = bulksSet[restPart] || null;
            }
            bulksSets.push(set);
        }

        return bulksSets;
    }

    /**
     * 頑シミュさんの "高速化２「打ち切る」" をしながら組み合わせを求める。
     *
     * bulksSet の bulks は、スキルポイントの合計の降順でソート済みの前提。
     */
    _combine(skillnames, bulksSet) {
        let borderLine = new util.BorderLine(this.context, skillnames, bulksSet);

        let combs = [ { eqcombs: [], sumSkills: null } ];

        for (let i = 0, ilen = parts.length; i < ilen; ++i) {
            let part = parts[i];
            let bulks = bulksSet[part];

            let seen = [];
            for (let j = 0, jlen = combs.length; j < jlen; ++j) {
                let comb = combs[j];
                let newCombs = this._combineEquip(comb, bulks, borderLine, part);
                seen = seen.concat(newCombs);

                if (this.threshold > 0 && seen.length > this.threshold) {
                    seen = seen.slice(0, this.threshold);
                    break;
                }
            }

            combs = this._compress(seen);

            // threshold で打ち切られた時に、できるだけ可能性の高い組み合わせを残すため
            // ソートしておく
            combs = this._sortCombs(combs);
        }

        return combs;
    }

    _combineEquip(comb, bulks, borderLine, part) {
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

            // bulks は合計ポイントで降順ソートされてるので
            // 合計ポイントが超えてなければ、以降の組み合わせでもダメ
            if (!isOverSum) break;

            let isOverEach = util.comb.isOver(blEach, skills);

            // 頑シミュさんの「打ち切る」は、処理対象のデータとして push しないことで実現
            if (!isOverEach) continue;

            ret.push(this._newComb(comb, bulk, part));
        }

        return ret;
    }

    _combineTorsoUp(comb, bulk, borderLine, part) {
        let ret = [];

        let blSum = borderLine.calcSum(part, comb.sumSkills);
        let blEach = borderLine.calcEach(part, comb.sumSkills);

        for (let i = 0, len = comb.eqcombs.length; i < len; ++i) {
            let eqcomb = comb.eqcombs[i];
            let bodySkills = eqcomb.bodySkills || {};

            let isOverSum  = util.skill.sum(bodySkills) >= blSum;
            let isOverEach = util.comb.isOver(blEach, bodySkills);

            if (!isOverSum || !isOverEach) continue;

            let newComb = {
                eqcombs: [ this._newEqcomb(eqcomb, bulk, part) ],
                sumSkills: util.skill.merge(comb.sumSkills, bodySkills)
            };
            ret.push(newComb);
        }

        return ret;
    }

    _newComb(comb, bulk, part) {
        comb = comb || { eqcombs: [], sumSkills: null };
        bulk = bulk || {};

        let srcEqcombs = comb.eqcombs;
        if (srcEqcombs.length === 0) srcEqcombs = [ {} ];

        let eqcombs = [];
        for (let i = 0, len = srcEqcombs.length; i < len; ++i) {
            let src    = srcEqcombs[i];
            let eqcomb = this._newEqcomb(src, bulk, part);
            eqcombs.push(eqcomb);
        }

        return {
            eqcombs: eqcombs,
            sumSkills: util.skill.merge(comb.sumSkills, bulk.skills)
        };
    }

    _newEqcomb(eqcomb, bulk, part) {
        let ret = util.clone(eqcomb);

        ret[part] = bulk.equips || [];

        if (part === 'body') ret.bodySkills = bulk.skills;

        return ret;
    }

    /**
     * combs を圧縮する。
     *
     * 以下の処理をすることで圧縮する。
     * * combs を comb の sumSkills でユニークにすることで数を減らす
     * * ユニークにする際、eqcombs をまとめる
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

            // eqcombs をまとめる
            bucket[key].eqcombs = bucket[key].eqcombs.concat(comb.eqcombs);
        }

        let ret = [];
        for (let key in bucket) ret.push(bucket[key]);

        return ret;
    }

    /**
     * combs を comb の sumSkills の合計ポイントの降順でソートする。
     */
    _sortCombs(combs) {
        let bucket = {};

        for (let i = 0, len = combs.length; i < len; ++i) {
            let comb = combs[i];

            let sum = util.skill.sum(comb.sumSkills);

            if (bucket[sum] == null) bucket[sum] = [];
            bucket[sum].push(comb);
        }

        let sorted = Object.keys(bucket).sort((a, b) => b - a);

        let ret = [];
        for (let i = 0, len = sorted.length; i < len; ++i) {
            let sum = sorted[i];
            ret = ret.concat(bucket[sum]);
        }

        return ret;
    }

    _brushUp(combs) {
        let eqcombs = [];

        for (let i = 0, ilen = combs.length; i < ilen; ++i) {
            eqcombs = eqcombs.concat(combs[i].eqcombs);
        }

        let ret = [];
        for (let i = 0, ilen = eqcombs.length; i < ilen; ++i) {
            let eqcomb  = eqcombs[i];
            let brushed = {};
            for (let j = 0, jlen = parts.length; j < jlen; ++j) {
                let part = parts[j];
                brushed[part] = eqcomb[part] || [];
            }
            ret.push(brushed);
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
