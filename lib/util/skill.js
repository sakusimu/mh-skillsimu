'use strict';

function isTorsoUp(tree) {
    if (tree === '胴系統倍加') return true;
    if (tree === '胴系統倍化') return true;
    return false;
}
exports.isTorsoUp = isTorsoUp;

function hasTorsoUp(skills) {
    if (skills == null) return false;
    if (skills['胴系統倍加']) return true;
    if (skills['胴系統倍化']) return true;
    return false;
}
exports.hasTorsoUp = hasTorsoUp;

/**
 * trees のみのスキルにまとめる。
 *
 * trees のスキルがない場合(undefined のプロパティ)は 0 で初期化。
 * skills に胴系統倍加がある場合は、trees に関係なく含める。
 */
function compact(trees, skills) {
    if (Array.isArray(skills)) {
        return _compact2(trees, skills);
    }
    return _compact1(trees, skills);
}
exports.compact = compact;

function _compact1(trees, skills) {
    trees = trees || [];
    skills  = skills || {};

    let ret = {};

    for (let i = 0, len = trees.length; i < len; ++i) {
        let tree = trees[i];
        ret[tree] = skills[tree] || 0;
    }

    for (let tree in skills) {
        if (isTorsoUp(tree)) {
            ret[tree] = skills[tree];
            break;
        }
    }

    return ret;
}
function _compact2(trees, skillsList) {
    let ret = [];

    for (let i = 0, len = skillsList.length; i < len; ++i) {
        let skills = skillsList[i];
        ret.push(_compact1(trees, skills));
    }

    if (ret.length === 0) ret = [ _compact1(trees) ];

    return ret;
}

/**
 * スキルに tree のスキル系統が含まれていたら true 、そうでなければ false を返す。
 */
function contains(skills, tree) {
    let trees = Array.isArray(tree) ? tree : [ tree ];
    for (let tree in skills) {
        for (let i = 0, len = trees.length; i < len; ++i) {
            if (tree === trees[i]) return true;
        }
    }
    return false;
}
exports.contains = contains;

/**
 * スキルが同じか調べる。
 *
 * 前提として skillsA と skillsB は全く同じプロパティを持っていること。
 */
function isEqual(skillsA, skillsB) {
    for (let tree in skillsA) {
        if (skillsA[tree] !== skillsB[tree]) return false;
    }
    return true;
}
exports.isEqual = isEqual;

/**
 * スキルのリストを結合する。
 * (胴系統倍加のポイントは加算しない)
 *
 * e.g.
 *     join([ { '攻撃': 1, '防御': -1 }, { '斬れ味': 1, '匠': -1 } ]);
 *     => { '攻撃': 1, '防御': -1, '斬れ味': 1, '匠': -1 }
 */
function join(skillsList) {
    skillsList = skillsList || [];
    let ret = {};
    for (let i = 0, len = skillsList.length; i < len; ++i) {
        let skills = skillsList[i];
        if (skills == null) continue;
        for (let tree in skills) {
            if (isTorsoUp(tree)) {
                ret[tree] = 1;
                continue;
            }
            if (ret[tree] == null) ret[tree] = 0;
            ret[tree] += skills[tree];
        }
    }
    return ret;
}
exports.join = join;

/**
 * スキルをマージする。
 * (胴系統倍加のポイントは加算しない)
 *
 * e.g.
 *     merge({ '攻撃': 1, '防御': -1 }, { '斬れ味': 1, '匠': -1 });
 *     => { '攻撃': 1, '防御': -1, '斬れ味': 1, '匠': -1 }
 */
function merge(a, b) {
    return join([ a, b ]);
}
exports.merge = merge;

/**
 * スキルのポイントを合計する。
 * (胴系統倍加のポイントは合計しない)
 *
 * e.g.
 *     sum({ '攻撃': 1, '斬れ味': 1 })
 *     => 2
 */
function sum(skills) {
    if (skills == null) return 0;
    let sum = 0;
    for (let tree in skills) {
        if (isTorsoUp(tree)) continue;
        sum += skills[tree];
    }
    return sum;
}
exports.sum = sum;

/**
 * スキル(の名前)から対応するスキル系統を返す。
 */
function trees(skills, names) {
    let ret = [];
    for (let i = 0, len = names.length; i < len; ++i) {
        let name  = names[i];
        let skill = skills[name];
        if (skill == null) throw new Error(name + ' is not found');
        ret.push(skill.tree);
    }
    return ret;
}
exports.trees = trees;

/**
 * セット or リストとして渡されたスキルを一つにまとめて返す。
 * (胴系統倍加も考慮)
 *
 * セットの場合のデータ構造
 *   { head: { skills: {}, ... }, ... }
 *
 * リストの場合のデータ構造
 *   [ { skills: {}, ... }, ... }
 *
 * リストの場合、最初の要素を胴として胴系統倍加を処理する。
 */
function unify(setOrList) {
    return Array.isArray(setOrList) ? _unifyList(setOrList) : _unifySet(setOrList);
}
exports.unify = unify;

function _unifySet(set) {
    let bodySkills = set.body ? (set.body.skills || {}) : {};

    let skillsList = [];
    for (let part in set) {
        let skills = set[part] ? (set[part].skills || {}) : {};
        if (hasTorsoUp(skills)) skills = bodySkills;
        skillsList.push(skills);
    }

    return join(skillsList);
}
function _unifyList(list) {
    let bodySkills = list[0] ? (list[0].skills || {}) : {};

    let skillsList = [];
    for (let i = 0, len = list.length; i < len; ++i) {
        let skills = list[i] ? (list[i].skills || {}) : {};
        if (hasTorsoUp(skills)) skills = bodySkills;
        skillsList.push(skills);
    }

    return join(skillsList);
}
