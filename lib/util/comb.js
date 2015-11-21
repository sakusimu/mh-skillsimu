'use strict';

/**
 * Combinator で使う関数を提供する。
 */

// 胴系統倍加を処理しやすくするため body が先頭にきた各部位の配列
const parts = [ 'body', 'head', 'arm', 'waist', 'leg', 'weapon', 'charm' ];
exports.parts = parts;

/**
 * skills が goal のスキルを発動しているか調べる。
 */
exports.activates = (skills, goal) => {
    if (goal == null) throw new Error('goal is required');

    for (let tree in goal) {
        let goalPt = goal[tree];
        let point  = skills[tree] || 0;
        if (point < goalPt) return false;
    }
    return true;
};

/**
 * skills が goal のスキルをちょうど発動しているか調べる。
 * (goal がマイナスのスキルの場合は、超えていればOK)
 */
exports.justActivates = (skills, goal) => {
    if (goal == null) throw new Error('goal is required');

    for (let tree in goal) {
        let goalPt = goal[tree];
        let point  = skills[tree] || 0;
        if (goalPt < 0 && point > goalPt) continue;
        if (point !== goalPt) return false;
    }
    return true;
};

exports.isOver = (skillsA, skillsB) => {
    for (let tree in skillsA) {
        let base  = skillsA[tree];
        let point = skillsB[tree] || 0;
        if (point < base) return false;
    }
    return true;
};
