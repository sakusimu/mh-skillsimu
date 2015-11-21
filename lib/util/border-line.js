'use strict';
const util = require('./skill');
const parts = require('./comb').parts; // parts 'body' is first

/**
 * Equip.Combinator で使うボーダーラインを計算するクラス。
 */
class BorderLine {
    constructor(context, skillnames, bulksSet, subtracted) {
        this.context = context;

        this.goal    = this._goal(skillnames, subtracted);
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
    _goal(skillnames, subtracted) {
        if (skillnames == null || skillnames.length === 0) return null;
        subtracted = subtracted || {};

        let goal = {};
        for (let i = 0, len = skillnames.length; i < len; ++i) {
            let name  = skillnames[i];
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
        let maxSkillsSet = {}; // 各部位ごとに最大ポイントのスキルを保持

        for (let i = 0, ilen = parts.length; i < ilen; ++i) {
            let part = parts[i];
            let bulks = bulksSet[part] || [];

            let maxSkills = {};
            for (let j = 0, jlen = bulks.length; j < jlen; ++j) {
                let skills = bulks[j].skills;

                // 胴系統倍加があったら他のスキルは付かない(付いてても無視して良い)前提
                if (util.hasTorsoUp(skills)) skills = maxSkillsSet.body;

                for (let tree in skills) {
                    if (util.isTorsoUp(tree)) continue;
                    buckets[tree] = true;
                    let point = skills[tree];
                    let maxPt = maxSkills[tree] || 0;
                    maxSkills[tree] = point >  maxPt ? point : maxPt;
                }
            }

            maxSkillsSet[part] = maxSkills;
        }

        // 扱いやすいようにデータの形を変える
        // { head: { '攻撃': 10, ... }, ... } -> { '攻撃': { head: 10, ... }, ... }
        let ret = {};
        for (let part in maxSkillsSet) {
            let maxSkills = maxSkillsSet[part];
            for (let tree in buckets) {
                let pt = maxSkills[tree] || 0;
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

        let set = {}; // { head: <max sum skill point>, body, ... }

        for (let i = 0, ilen = parts.length; i < ilen; ++i) {
            let part  = parts[i];
            let bulks = bulksSet[part] || [];

            let sum = 0;
            for (let j = 0, jlen = bulks.length; j < jlen; ++j) {
                let skills = bulks[j].skills;
                let curSum = util.sum(skills);

                // 胴系統倍加があったら他のスキルは付かない(付いてても無視して良い)前提
                if (util.hasTorsoUp(skills)) curSum = set.body;

                sum = curSum > sum ? curSum : sum;
            }

            set[part] = sum;
        }

        return set;
    }

    /**
     * 現在のスキルと残りの部位で想定し得る最大値から、必要なボーダーラインとなる
     * 個別ポイントを計算。
     */
    calcEach(curPart, skills) {
        skills = skills || {};

        let index = parts.indexOf(curPart);
        if (index === -1) throw new Error('unknown part:' + curPart);
        let start = index + 1;

        let ret = {};
        for (let tree in this.eachSkill) {
            let point = this.goal[tree] - (skills[tree] || 0);

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
    calcSum(curPart, skills) {
        let curSum = util.sum(skills);

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
