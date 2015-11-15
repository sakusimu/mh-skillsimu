'use strict';

function isTorsoUp(skillTree) {
    if (skillTree === '胴系統倍加') return true;
    if (skillTree === '胴系統倍化') return true;
    return false;
}
exports.isTorsoUp = isTorsoUp;

function hasTorsoUp(skillComb) {
    if (skillComb == null) return false;
    if (skillComb['胴系統倍加']) return true;
    if (skillComb['胴系統倍化']) return true;
    return false;
}
exports.hasTorsoUp = hasTorsoUp;

/**
 * skillTrees のみのスキルの組み合わせにまとめる。
 *
 * skillTrees のスキルがない場合(undefined のプロパティ)は 0 で初期化。
 * skillComb に胴系統倍加がある場合は、skillTrees に関係なく含める。
 */
function compact(skillTrees, skillComb) {
    if (Array.isArray(skillComb)) {
        return _compact2(skillTrees, skillComb);
    }
    return _compact1(skillTrees, skillComb);
}
exports.compact = compact;

function _compact1(skillTrees, skillComb) {
    skillTrees = skillTrees || [];
    skillComb  = skillComb  || {};

    let ret = {};

    for (let i = 0, len = skillTrees.length; i < len; ++i) {
        let tree = skillTrees[i];
        ret[tree] = skillComb[tree] || 0;
    }

    for (let tree in skillComb) {
        if (isTorsoUp(tree)) {
            ret[tree] = skillComb[tree];
            break;
        }
    }

    return ret;
}
function _compact2(skillTrees, skillCombs) {
    let ret = [];

    for (let i = 0, len = skillCombs.length; i < len; ++i) {
        let sc = skillCombs[i];
        ret.push(_compact1(skillTrees, sc));
    }

    if (ret.length === 0) ret = [ _compact1(skillTrees) ];

    return ret;
}

/**
 * スキルの組み合わせに skillTree のスキル系統が含まれていたら true 、
 * そうでなければ false を返す。
 */
function contains(skillComb, skillTree) {
    let trees = Array.isArray(skillTree) ? skillTree : [ skillTree ];
    for (let combTree in skillComb) {
        for (let i = 0, len = trees.length; i < len; ++i) {
            if (combTree === trees[i]) return true;
        }
    }
    return false;
}
exports.contains = contains;

/**
 * スキルの組み合わせが同じか調べる。
 *
 * 前提として combA と combB は全く同じプロパティを持っていること。
 */
function isEqual(combA, combB) {
    for (let key in combA) {
        if (combA[key] !== combB[key]) return false;
    }
    return true;
}
exports.isEqual = isEqual;

/**
 * スキルの組み合わせのリストを結合する。
 * (胴系統倍加のポイントは加算しない)
 *
 * e.g.
 *     join([ { '攻撃': 1, '防御': -1 }, { '斬れ味': 1, '匠': -1 } ]);
 *     => { '攻撃': 1, '防御': -1, '斬れ味': 1, '匠': -1 }
 */
function join(combs) {
    combs = combs || [];
    let ret = {};
    for (let i = 0, len = combs.length; i < len; ++i) {
        let comb = combs[i];
        if (comb == null) continue;
        for (let tree in comb) {
            if (isTorsoUp(tree)) {
                ret[tree] = 1;
                continue;
            }
            if (ret[tree] == null) ret[tree] = 0;
            ret[tree] += comb[tree];
        }
    }
    return ret;
}
exports.join = join;

/**
 * スキルの組み合わせをマージする。
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
 * スキルの組み合わせのスキルポイントを合計する。
 * (胴系統倍加のポイントは合計しない)
 *
 * e.g.
 *     sum({ '攻撃': 1, '斬れ味': 1 })
 *     => 2
 */
function sum(skillComb) {
    if (skillComb == null) return 0;
    let sum = 0;
    for (let tree in skillComb) {
        if (isTorsoUp(tree)) continue;
        sum += skillComb[tree];
    }
    return sum;
}
exports.sum = sum;

/**
 * スキル(の名前)から対応するスキル系統を返す。
 */
function trees(skills, skillNames) {
    let skillTrees = [];
    for (let i = 0, len = skillNames.length; i < len; ++i) {
        let name  = skillNames[i];
        let skill = skills[name];
        if (skill == null) throw new Error(name + ' is not found');
        skillTrees.push(skill.tree);
    }
    return skillTrees;
}
exports.trees = trees;

/**
 * セット or リストとして渡されたスキルを一つにまとめて返す。
 * (胴系統倍加も考慮)
 *
 * セットの場合のデータ構造
 *   { head: { skillComb: {}, ... }, ... }
 *
 * リストの場合のデータ構造
 *   [ { skillComb: {}, ... }, ... }
 *
 * リストの場合、最初の要素を胴として胴系統倍加を処理する。
 */
function unify(setOrList) {
    return Array.isArray(setOrList) ? _unifyList(setOrList) : _unifySet(setOrList);
}
exports.unify = unify;

function _unifySet(set) {
    let bodySC = set.body ? (set.body.skillComb || {}) : {};

    let combs = [];
    for (let part in set) {
        let skillComb = set[part] ? (set[part].skillComb || {}) : {};
        if (hasTorsoUp(skillComb)) skillComb = bodySC;
        combs.push(skillComb);
    }

    return join(combs);
}
function _unifyList(list) {
    let bodySC = list[0] ? (list[0].skillComb || {}) : {};

    let combs = [];
    for (let i = 0, len = list.length; i < len; ++i) {
        let skillComb = list[i] ? (list[i].skillComb || {}) : {};
        if (hasTorsoUp(skillComb)) skillComb = bodySC;
        combs.push(skillComb);
    }

    return join(combs);
}
