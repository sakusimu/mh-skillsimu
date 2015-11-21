'use strict';
const util = require('../util');

/**
 * 条件となるスキルを元に、対象となる装備と装飾品で実現できる
 * 装備とスキルを正規化するクラス。
 *
 * 頑シミュさんの "高速化１「まとめる」" を行っている。
 * (cf. http://www.geocities.jp/masax_mh/logic/page4_speed1.html)
 *
 *     let n = new Normalizer(context)
 *     n.normalize([ '攻撃力UP【大】', '業物' ]);
 *     => { head: [
 *            { skills: { '攻撃': 0, '斬れ味': 0 },
 *              equips: [ 'ボーンヘルム','ボーンキャップ',...,'逆巻く怒髪','威圧の逆髪' ] },
 *            { skills: { '攻撃': 0, '斬れ味': 0, '胴系統倍加': 1 },
 *              equips: [ 'クロオビヘルム', 'スカルヘッド', '伝説Ｊハット' ] },
 *            { skills: { '攻撃': 1, '斬れ味': 0 },
 *              equips: [ 'ブレイブヘッド','レザーヘッド','チェーンヘッド',... ] },
 *            { skills: { '攻撃': 0, '斬れ味': 1 },
 *              equips: [ 'ブレイブヘッド','レザーヘッド','チェーンヘッド',... ] },
 *            { skills: { '攻撃': 1, '斬れ味': 1 },
 *              equips: [ 'ジャギィヘルム','ズワロフード','ゲネポスキャップ',... ] },
 *            { skills: { '攻撃': 0, '斬れ味': 2 },
 *              equips: [ 'ジャギィヘルム','ズワロフード','ゲネポスキャップ',... ] },
 *            { skills: { '攻撃': 2, '斬れ味': 0 }, equips: [ 'ランポスＳキャップ' ] },
 *            { skills: { '攻撃': 3, '斬れ味': 0 },
 *              equips: [ 'ジャギィヘルム','ズワロフード','ゲネポスキャップ',... ] },
 *            ... ],
 *          body  : [ ... ],
 *          arm   : [ ... ],
 *          waist : [ ... ],
 *          leg   : [ ... ],
 *          weapon: [ ... ],
 *          charm : [ ... ] }
 *
 * ここでいう正規化とは以下の処理を行うこと。
 * 1. 対象となる装備と装飾品から、スキルを
 *      { 装備名: [ { スキル系統: ポイント }, ... ] }
 *    というデータにする
 * 2. 条件のスキル系統のみで構成されたスキルにする(関係ないスキルは省く)
 * 3. 装備単位でスキルをポイントの大きいものにまとめる
 * 4. スキルのポイントが同じ装備をまとめる
 *
 * データについて
 * * bulk  正規化した結果の、装備とスキルをまとめたもの
 *   e.g.
 *       { skills: { '攻撃': 3, '斬れ味': 1 }, equips: [ 'head1', 'head2', ... ] }
 *
 * * bulksSet  bulk の配列を装備の部位ごとにもつデータ
 *   e.g.
 *       { head: [ bulk, ... ], body: [ bulk, ... ], ... }
 */
class Normalizer {
    constructor(context) {
        if (context == null) throw new Error('context is required');
        this.context = context;
    }

    /**
     * 引数のスキルを元に、対象となる装備と装飾品で実現できる装備とスキルを
     * まとめたものを返す。
     */
    normalize(skillnames) {
        if (skillnames == null || skillnames.length === 0) return null;

        let skilltrees = util.skill.trees(this.context.skills, skillnames);
        if (skilltrees.length === 0) return null;

        let parts = util.parts; // alias

        let bulksSet = {};
        for (let i = 0, len = parts.length; i < len; ++i) {
            let part   = parts[i];
            let equips = this.context.equips[part];

            if (equips == null || equips.length === 0) {
                bulksSet[part] = [];
                continue;
            }

            let combs;
            combs = this._normalize1(equips, skilltrees);
            combs = this._normalize2(combs, skilltrees);
            combs = this._normalize3(combs);
            let bulks = this._normalize4(combs);

            bulksSet[part] = bulks;
        }

        return bulksSet;
    }

    /**
     * 正規化の 1 を行う。
     *
     * 1. 対象となる装備と装飾品から、スキルを
     *      { 装備名: [ { スキル系統: ポイント }, ... ] }
     *    というデータにする
     */
    _normalize1(equips, skilltrees) {
        let skillsCombBySlot = util.deco.skillsCombBySlot(this.context.decos, skilltrees);
        let ret = {};

        for (let i = 0, ilen = equips.length; i < ilen; ++i) {
            let equip = equips[i];
            let slot  = equip.slot;
            let skillsComb = skillsCombBySlot[slot];

            skillsComb = skillsComb.length === 0 ? [ null ] : skillsComb;
            let combs = [];
            for (let j = 0, jlen = skillsComb.length; j < jlen; ++j) {
                let skills = util.skill.merge(equip.skills, skillsComb[j]);
                if (Object.keys(skills).length) combs.push(skills);
            }

            ret[equip.name] = combs;
        }

        return ret;
    }

    /**
     * 正規化の 2 を行う。
     *
     * 2. 条件のスキル系統のみで構成されたスキルにする(関係ないスキルは省く)
     */
    _normalize2(combs, skilltrees) {
        for (let eqname in combs) {
            combs[eqname] = util.skill.compact(skilltrees, combs[eqname]);
        }
        return combs;
    }

    /**
     * 正規化の 3 を行う。
     *
     * 3. 装備単位でスキルをポイントの大きいものにまとめる
     */
    _normalize3(combs) {
        for (let eqname in combs) {
            combs[eqname] = this._collectMaxSkill(combs[eqname]);
        }

        return combs;
    }

    /**
     * 正規化の 4 を行う。
     *
     * 4. スキルのポイントが同じ装備をまとめる
     */
    _normalize4(combs) {
        // 同じ合計ポイントじゃないと同じポイントのスキルにはならないので
        // 合計ポイントでまとめて調べる量を減らす
        let buckets = {};
        for (let eqname in combs) {
            let skillsComb = combs[eqname];
            for (let i = 0, ilen = skillsComb.length; i < ilen; ++i) {
                let skills = skillsComb[i];
                let sum = util.skill.sum(skills);
                if (buckets[sum] == null) buckets[sum] = [];
                let bulk = { skills: skills, equips: [ eqname ] };
                buckets[sum].push(bulk);
            }
        }

        let ret = [];
        for (let sum in buckets) {
            let bulks = buckets[sum];
            let uniqs = []; // uniq bulks

            for (let i = 0, ilen = bulks.length; i < ilen; ++i) {
                let bulk = bulks[i];
                let same = null; // same skills bulk
                for (let j = 0, jlen = uniqs.length; j < jlen; ++j) {
                    let uniq = uniqs[j];
                    if (util.skill.isEqual(bulk.skills, uniq.skills)) {
                        same = uniq;
                        break;
                    }
                }
                if (same) {
                    same.equips = same.equips.concat(bulk.equips);
                    continue;
                }
                uniqs.push(bulk);
            }

            ret = ret.concat(uniqs);
        }

        return ret;
    }

    /**
     * スキルの組み合わせをポイントが大きいものにまとめる。
     *
     * 前提として、処理対象の skillsComb は、ひとつの装備に装飾品を
     * 組み合わせたものなので、 skillsComb 内に同じ組み合わせは出現しない。
     *
     * e.g.
     *     let sc = [ { '攻撃': 1, '斬れ味': 0 }, { '攻撃': 2, '斬れ味': 0 },
     *                { '攻撃': 1, '斬れ味': 1 } ];
     *     _collectMaxSkill(sc);
     *     => [ { '攻撃': 2, '斬れ味': 0 }, { '攻撃': 1, '斬れ味': 1 } ]
     */
    _collectMaxSkill(skillsComb) {
        let ret = [];

        for (let i = 0, len = skillsComb.length; i < len; ++i) {
            let dst = skillsComb[i];
            let max = true;

            for (let j = 0; j < len; ++j) {
                let src = skillsComb[j];
                if (i === j) continue;
                if (!this._compareAny(src, dst)) {
                    max = false;
                    break;
                }
            }

            if (max) ret.push(dst);
        }

        return ret;
    }

    /**
     * スキルを比べる。
     * いずれかのスキルのポイントで srcSkills < dstSkills なら true 、そうでないなら false 。
     *
     * 前提として srcSkills と dstSkills は全く同じプロパティを持っていること。
     * つまり、 srcSkills が { '攻撃': 1, '斬れ味': 1 } の場合
     * dstSkills は { '攻撃': 2 } ではなく { '攻撃' 2, '斬れ味': 0 } ということ。
     *
     * srcSkills = { a: 1 } で dstSkills = { b: 1 } の場合に
     * srcSkills = { a: 1, b: 0 }, dstSkills = { a: 0, b: 1 } としてまで処理はしない。
     */
    _compareAny(srcSkills, dstSkills) {
        for (let tree in srcSkills) {
            let srcPt = srcSkills[tree], dstPt = dstSkills[tree];
            if (srcPt < dstPt) return true;
        }
        return false;
    }
}

module.exports = Normalizer;
