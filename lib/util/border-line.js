'use strict';
const util = require('./skill');
const parts = require('./comb').parts;

/**
 * Equip.Combinator で使うボーダーラインを計算するクラス。
 */
class BorderLine {
    constructor(context, skillNames, bulksSet, subtracted) {
        this.context = context;

        this.goal    = this._goal(skillNames, subtracted);
        this.goalSum = util.sum(this.goal);

        this.eachSkill = this._calcMaxEachSkillPoint(bulksSet);
        this.maxSumSet = this._calcMaxSumSkillPoint(bulksSet);
    }

    /**
     * 検索条件となるスキルから必要なスキル系統のポイントを返す。
     *
     * e.g.
     *     _goal([ '攻撃力UP【大】', '業物' ]);
     *     => { '攻撃': 20, '斬れ味': 10 }
     */
    _goal(skillNames, subtracted) {
        if (skillNames == null || skillNames.length === 0) return null;
        subtracted = subtracted || {};

        let goal = {};
        for (let i = 0, len = skillNames.length; i < len; ++i) {
            let name  = skillNames[i];
            let skill = this.context.skills[name];
            if (skill == null) throw new Error ('skill not found: ' + name);
            let subPt = subtracted[skill.tree] || 0;
            goal[skill.tree] = skill.point - subPt;
        }

        return goal;
    }

    /**
     * 部位ごとに、各スキルの取り得る最大ポイントを計算。
     */
    _calcMaxEachSkillPoint(bulksSet) {
        if (bulksSet == null) return null;

        let buckets = {}; // bulksSet 内にあった全てのスキル名(胴系統倍加を除く)を覚えておく
        let maxSkillCombSet = {}; // 各部位ごとに最大ポイントのスキルを保持

        for (let i = 0, ilen = parts.length; i < ilen; ++i) {
            let part = parts[i];
            let combs = bulksSet[part] || [];

            let maxSC = {};
            for (let j = 0, jlen = combs.length; j < jlen; ++j) {
                let skillComb = combs[j].skillComb;

                // 胴系統倍加があったら他のスキルは付かない(付いてても無視して良い)前提
                if (util.hasTorsoUp(skillComb)) skillComb = maxSkillCombSet.body;

                for (let tree in skillComb) {
                    if (util.isTorsoUp(tree)) continue;
                    buckets[tree] = true;
                    let point = skillComb[tree];
                    let maxPt = maxSC[tree] || 0;
                    maxSC[tree] = point >  maxPt ? point : maxPt;
                }
            }

            maxSkillCombSet[part] = maxSC;
        }

        // 扱いやすいようにデータの形を変える
        // { head: { '攻撃': 10, ... }, ... } -> { '攻撃': { head: 10, ... }, ... }
        let ret = {};
        for (let part in maxSkillCombSet) {
            let maxSC = maxSkillCombSet[part];
            for (let tree in buckets) {
                let pt = maxSC[tree] || 0;
                if (ret[tree] === undefined) ret[tree] = {};
                ret[tree][part] = pt;
            }
        }

        return ret;
    }

    /**
     * 部位ごとに、最大の合計ポイントを計算。
     */
    _calcMaxSumSkillPoint(bulksSet) {
        if (bulksSet == null) return null;

        let msspSet = {}; // mssp: max sum skill point

        for (let i = 0, ilen = parts.length; i < ilen; ++i) {
            let part  = parts[i];
            let combs = bulksSet[part] || [];

            let sum = 0;
            for (let j = 0, jlen = combs.length; j < jlen; ++j) {
                let skillComb = combs[j].skillComb;
                let curSum    = util.sum(skillComb);

                // 胴系統倍加があったら他のスキルは付かない(付いてても無視して良い)前提
                if (util.hasTorsoUp(skillComb)) curSum = msspSet.body;

                sum = curSum > sum ? curSum : sum;
            }

            msspSet[part] = sum;
        }

        return msspSet;
    }

    /**
     * 現在のスキルと残りの部位で想定し得る最大値から、必要なボーダーラインとなる
     * 個別ポイントを計算。
     */
    calcEach(curPart, skillComb) {
        skillComb = skillComb || {};

        let index = parts.indexOf(curPart);
        if (index === -1) throw new Error('unknown part:' + curPart);
        let start = index + 1;

        let ret = {};
        for (let tree in this.eachSkill) {
            let point = this.goal[tree] - (skillComb[tree] || 0);

            let maxPtSet = this.eachSkill[tree];
            for (let i = start, len = parts.length; i < len; ++i) {
                let restPart = parts[i];
                point -= maxPtSet[restPart];
            }

            ret[tree] = point;
        }

        return ret;
    }

    /**
     * 現在のスキルと残りの部位で想定し得る最大値から、必要なボーダーラインとなる
     * 合計ポイントを計算。
     */
    calcSum(curPart, skillComb) {
        let curSum = util.sum(skillComb);

        let index = parts.indexOf(curPart);
        if (index === -1) throw new Error('unknown part:' + curPart);
        let start = index + 1;

        let ret = this.goalSum - curSum;
        for (let i = start, len = parts.length; i < len; ++i) {
            let restPart = parts[i];
            ret -= this.maxSumSet[restPart];
        }

        return ret;
    }
}

module.exports = BorderLine;
