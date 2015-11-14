'use strict';
const data = require('../data');
const util = require('../util');

/**
 * 条件となるスキルを元に、対象となる装備と装飾品で実現できる
 * 装備とスキルの組み合わせを正規化するクラス。
 *
 * 頑シミュさんの "高速化１「まとめる」" を行っている。
 * (cf. http://www.geocities.jp/masax_mh/logic/page4_speed1.html)
 *
 *     let n = new Normalizer()
 *     n.normalize([ '攻撃力UP【大】', '業物' ]);
 *     => { head: [
 *            { skillComb: { '攻撃': 0, '斬れ味': 0 },
 *              equips: [ 'ボーンヘルム','ボーンキャップ',...,'逆巻く怒髪','威圧の逆髪' ] },
 *            { skillComb: { '攻撃': 0, '斬れ味': 0, '胴系統倍加': 1 },
 *              equips: [ 'クロオビヘルム', 'スカルヘッド', '伝説Ｊハット' ] },
 *            { skillComb: { '攻撃': 1, '斬れ味': 0 },
 *              equips: [ 'ブレイブヘッド','レザーヘッド','チェーンヘッド',... ] },
 *            { skillComb: { '攻撃': 0, '斬れ味': 1 },
 *              equips: [ 'ブレイブヘッド','レザーヘッド','チェーンヘッド',... ] },
 *            { skillComb: { '攻撃': 1, '斬れ味': 1 },
 *              equips: [ 'ジャギィヘルム','ズワロフード','ゲネポスキャップ',... ] },
 *            { skillComb: { '攻撃': 0, '斬れ味': 2 },
 *              equips: [ 'ジャギィヘルム','ズワロフード','ゲネポスキャップ',... ] },
 *            { skillComb: { '攻撃': 2, '斬れ味': 0 }, equips: [ 'ランポスＳキャップ' ] },
 *            { skillComb: { '攻撃': 3, '斬れ味': 0 },
 *              equips: [ 'ジャギィヘルム','ズワロフード','ゲネポスキャップ',... ] },
 *            ... ],
 *          body  : [ ... ],
 *          arm   : [ ... ],
 *          waist : [ ... ],
 *          leg   : [ ... ],
 *          weapon: [ ... ],
 *          oma   : [ ... ] }
 *
 * スキルの組み合わせとは、スキル系統とポイントの組み合わせのことで
 *   { スキル系統: ポイント }
 * というオブジェクト。
 * e.g.
 *   ジンオウメイル => { '本気': 3, '雷属性攻撃': 1, '斬れ味': 2, '気配': -3 }
 *   攻撃珠【１】   => { '攻撃': 1, '防御': -1 }
 *
 * ここでいう正規化とは以下の処理を行うこと。
 * 1. 対象となる装備と装飾品から、スキルの組み合わせを
 *      { 装備名: [ { スキル系統: ポイント } ] }
 *    というデータにする
 * 2. 条件のスキル系統のみで構成されたスキルの組み合わせにする(関係ないスキルは省く)
 * 3. 装備単位でスキルの組み合わせをポイントの大きいものにまとめる
 * 4. 同じスキルの組み合わせの装備をまとめる
 */
class Normalizer {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.equips = data.equips;
    }

    /**
     * 引数のスキルを元に、対象となる装備と装飾品で実現できる
     * 装備とスキルの組み合わせを返す。
     */
    normalize(skillNames) {
        if (skillNames == null || skillNames.length === 0) return null;

        let skillTrees = util.skill.trees(skillNames);
        if (skillTrees.length === 0) return null;

        let parts = util.parts; // alias

        let ret = {};
        for (let i = 0, len = parts.length; i < len; ++i) {
            let part   = parts[i];
            let equips = this.equips[part];

            if (equips == null || equips.length === 0) {
                ret[part] = [];
                continue;
            }

            let combs;
            combs = this._normalize1(equips, skillTrees);
            combs = this._normalize2(combs, skillTrees);
            combs = this._normalize3(combs);
            ret[part] = this._normalize4(combs);
        }

        return ret;
    }

    /**
     * 正規化の 1 を行う。
     *
     * 1. 対象となる装備と装飾品から、スキルの組み合わせを
     *      { 装備名: [ { スキル系統: ポイント } ] }
     *    というデータにする
     */
    _normalize1(equips, skillTrees) {
        let decoCombs = util.deco.skillCombs(skillTrees);
        let ret = {};

        for (let i = 0, ilen = equips.length; i < ilen; ++i) {
            let equip = equips[i];
            let slot  = equip.slot;
            let decoComb = decoCombs[slot];

            decoComb = decoComb.length === 0 ? [ null ] : decoComb;
            let combs = [];
            for (let j = 0, jlen = decoComb.length; j < jlen; ++j) {
                let sc = util.skill.merge(equip.skillComb, decoComb[j]);
                if (Object.keys(sc).length) combs.push(sc);
            }

            ret[equip.name] = combs;
        }

        return ret;
    }

    /**
     * 正規化の 2 を行う。
     *
     * 2. 条件のスキル系統のみで構成されたスキルの組み合わせにする(関係のないスキルは省く)
     */
    _normalize2(combs, skillTrees) {
        for (let equipName in combs) {
            combs[equipName] = util.skill.compact(skillTrees, combs[equipName]);
        }
        return combs;
    }

    /**
     * 正規化の 3 を行う。
     *
     * 3. 装備単位でスキルの組み合わせをポイントの大きいものにまとめる
     */
    _normalize3(combs) {
        for (let equipName in combs) {
            combs[equipName] = this._collectMaxSkill(combs[equipName]);
        }

        return combs;
    }

    /**
     * 正規化の 4 を行う。
     *
     * 4. 同じスキルの組み合わせの装備をまとめる
     */
    _normalize4(combs) {
        // 同じ合計ポイントじゃないと同じスキルの組み合わせにはならないので
        // 合計ポイントでまとめて調べる量を減らす
        let buckets = {};
        for (let equipName in combs) {
            let skillCombs = combs[equipName];
            for (let i = 0, ilen = skillCombs.length; i < ilen; ++i) {
                let sc  = skillCombs[i];
                let sum = util.skill.sum(sc);
                if (buckets[sum] == null) buckets[sum] = [];
                let bulk = { skillComb: sc, equips: [ equipName ] };
                buckets[sum].push(bulk);
            }
        }

        let ret = [];
        for (let point in buckets) {
            let bulks = buckets[point];
            let uniqs = []; // uniq bulks

            for (let i = 0, ilen = bulks.length; i < ilen; ++i) {
                let rest = bulks[i];
                let same = null;
                for (let j = 0, jlen = uniqs.length; j < jlen; ++j) {
                    let uniq = uniqs[j];
                    if (util.skill.isEqual(rest.skillComb, uniq.skillComb)) {
                        same = uniq;
                        break;
                    }
                }
                if (same) {
                    same.equips = same.equips.concat(rest.equips);
                    continue;
                }
                uniqs.push(rest);
            }

            ret = ret.concat(uniqs);
        }

        return ret;
    }

    /**
     * スキルの組み合わせをポイントが大きいものにまとめる。
     *
     * 前提として、処理対象の skillCombs は、ひとつの装備に装飾品を
     * 組み合わせたものなので、 skillCombs 内に同じ組み合わせは出現しない。
     *
     * e.g.
     *     let sc = [ { '攻撃': 1, '斬れ味': 0 }, { '攻撃': 2, '斬れ味': 0 },
     *                { '攻撃': 1, '斬れ味': 1 } ];
     *     _collectMaxSkill(sc);
     *     => [ { '攻撃': 2, '斬れ味': 0 }, { '攻撃': 1, '斬れ味': 1 } ]
     */
    _collectMaxSkill(skillCombs) {
        let ret = [];

        for (let i = 0, len = skillCombs.length; i < len; ++i) {
            let dstComb = skillCombs[i];
            let max = true;

            for (let j = 0; j < len; ++j) {
                let srcComb = skillCombs[j];
                if (i === j) continue;
                if (!this._compareAny(srcComb, dstComb)) {
                    max = false;
                    break;
                }
            }

            if (max) ret.push(dstComb);
        }

        return ret;
    }

    /**
     * スキルの組み合わせを比べる。
     * いずれかのスキルのポイントで srcComb < dstComb なら true 、そうでないなら false 。
     *
     * 前提として srcComb と dstComb は全く同じプロパティを持っていること。
     * つまり、 srcComb が { '攻撃': 1, '斬れ味': 1 } の場合
     * dstComb は { '攻撃': 2 } ではなく { '攻撃' 2, '斬れ味': 0 } ということ。
     *
     * srcComb = { a: 1 } で dstComb = { b: 1 } の場合に
     * srcComb = { a: 1, b: 0 }, dstComb = { a: 0, b: 1 } としてまで処理はしない。
     */
    _compareAny(srcComb, dstComb) {
        for (let skill in srcComb) {
            let srcPt = srcComb[skill], dstPt = dstComb[skill];
            if (srcPt < dstPt) return true;
        }
        return false;
    }
}

module.exports = Normalizer;
