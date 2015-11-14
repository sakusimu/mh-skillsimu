'use strict';

/**
 * Combinator で使う関数を提供する。
 */

// 胴系統倍加を処理しやすくするため body が先頭にきた各部位の配列
const parts = [ 'body', 'head', 'arm', 'waist', 'leg', 'weapon', 'oma' ];
exports.parts = parts;

/**
 * skillComb が goal のスキルを発動しているか調べる。
 */
exports.activates = (skillComb, goal) => {
    if (goal == null) throw new Error('goal is required');

    for (let tree in goal) {
        let goalPt = goal[tree],
            point  = skillComb[tree] || 0;
        if (point < goalPt) return false;
    }
    return true;
};

/**
 * skillComb が goal のスキルをちょうど発動しているか調べる。
 * (goal がマイナスのスキルの場合は、超えていればOK)
 */
exports.justActivates = (skillComb, goal) => {
    if (goal == null) throw new Error('goal is required');

    for (let tree in goal) {
        let goalPt = goal[tree],
            point  = skillComb[tree] || 0;
        if (goalPt < 0 && point > goalPt) continue;
        if (point !== goalPt) return false;
    }
    return true;
};

exports.isOver = (skillCombA, skillCombB) => {
    for (let tree in skillCombA) {
        let base  = skillCombA[tree],
            point = skillCombB[tree] || 0;
        if (point < base) return false;
    }
    return true;
};
