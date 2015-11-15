'use strict';
const util = require('./skill');

/**
 * スキル系統にマッチする装飾品を抽出。
 * (スキル系統のポイント > 0 のものにしぼる)
 */
function filter(decos, skillTrees) {
    if (decos == null || decos.length === 0) return [];
    if (skillTrees == null || skillTrees.length === 0) return [];

    let ret = [];

    for (let i = 0, ilen = decos.length; i < ilen; ++i) {
        let deco = decos[i];
        for (let j = 0, jlen = skillTrees.length; j < jlen; ++j) {
            let tree = skillTrees[j];
            let pt = deco.skillComb[tree] || 0;
            if (pt > 0) ret.push(deco);
        }
    }

    return ret;
}
exports.filter = filter;

/**
 * 引数のスキル系統を元に、対象となる装飾品で実現できる
 * スキル系統とポイントの組み合わせを返す。
 *
 * スロットが 0 ～ 3 の全てのパターンを返す。
 * つまり、戻り値は
 *   [ [ 0スロの組み合わせ ], [ 1スロの ], [ 2スロの ], [ 3スロの ] ]
 * という形式。
 *
 * e.g.
 *     skillCombs(decos, [ '攻撃', '斬れ味' ]);
 *     => [ [],
 *          [ { '攻撃': 1, '防御': -1 }, { '斬れ味': 1, '匠': -1 } ],
 *          [ { '攻撃': 2, '防御': -2 },
 *            { '攻撃': 1, '防御': -1, '斬れ味': 1, '匠': -1 },
 *            { '斬れ味': 2, '匠': -2 },
 *            { '攻撃': 3, '防御': -1 } ],
 *          [ { '攻撃': 3, '防御': -3 },
 *            { '攻撃': 2, '防御': -2, '斬れ味': 1, '匠': -1 },
 *            { '攻撃': 1, '防御': -1, '斬れ味': 2, '匠': -2 },
 *            { '斬れ味': 3, '匠': -3 },
 *            { '攻撃': 4, '防御': -2 },
 *            { '攻撃': 3, '防御': -1, '斬れ味': 1, '匠': -1 },
 *            { '攻撃': 5, '防御': -1 },
 *            { '斬れ味': 4, '匠': -2 } ] ]
 */
function skillCombs(decos, skillTrees) {
    if (skillTrees == null || skillTrees.length === 0) return [];

    let decoCombs = combs(decos, skillTrees);
    let ret = [];

    for (let i = 0, ilen = decoCombs.length; i < ilen; ++i) {
        let decosList = decoCombs[i];
        let merges = [];
        for (let j = 0, jlen = decosList.length; j < jlen; ++j) {
            let decos = decosList[j];
            let list = [];
            for (let k = 0, klen = decos.length; k < klen; ++k) {
                list.push(decos[k].skillComb);
            }
            merges.push(util.join(list));
        }
        ret.push(merges);
    }

    return ret;
}
exports.skillCombs = skillCombs;

/**
 * 引数のスキル系統を元に、対象となる装飾品で実現できる
 * 装飾品の組み合わせを返す。
 *
 * e.g.
 *     combs(decos, [ '攻撃', '斬れ味' ]);
 *     => [ [],
 *          [ [ 攻撃珠【１】 ], [ 斬鉄珠【１】 ] ],
 *          [ [ 攻撃珠【１】, 攻撃珠【１】 ],
 *            [ 攻撃珠【１】, 斬鉄珠【１】 ],
 *            [ 斬鉄珠【１】, 斬鉄珠【１】 ],
 *            [ 攻撃珠【２】 ] ],
 *          [ [ 攻撃珠【１】, 攻撃珠【１】, 攻撃珠【１】 ],
 *            [ 攻撃珠【１】, 攻撃珠【１】, 斬鉄珠【１】 ],
 *            [ 攻撃珠【１】, 斬鉄珠【１】, 斬鉄珠【１】 ],
 *            [ 斬鉄珠【１】, 斬鉄珠【１】, 斬鉄珠【１】 ],
 *            [ 攻撃珠【２】, 攻撃珠【１】 ],
 *            [ 攻撃珠【２】, 斬鉄珠【１】 ],
 *            [ 攻撃珠【３】 ], [ 斬鉄珠【３】 ] ] ]
 */
function combs(decos, skillTrees) {
    if (skillTrees == null || skillTrees.length === 0) return [];

    decos = filter(decos, skillTrees);

    decos = _groupBySlot(decos);

    let slot0 = [];
    let slot1 = _rcomb1(decos[1]);

    let slot2 = _rcomb2(decos[1]);
    slot2 = slot2.concat(_rcomb1(decos[2]));

    let slot3 = _rcomb3(decos[1]);
    if (decos[1].length) {
        for (let i = 0, ilen = decos[2].length; i < ilen; ++i) {
            let d2 = decos[2][i];
            for (let j = 0, jlen = decos[1].length; j < jlen; ++j) {
                let d1 = decos[1][j];
                slot3.push([ d2, d1 ]);
            }
        }
    } else {
        slot3 = slot3.concat(_rcomb1(decos[2]));
    }
    slot3 = slot3.concat(_rcomb1(decos[3]));

    return [ slot0, slot1, slot2, slot3 ];
}
exports.combs = combs;

/**
 * 装飾品をスロットごとにまとめる。
 *
 * e.g.
 *     let decos = [ 攻撃珠【１】, 攻撃珠【２】, 攻撃珠【３】,
 *                   斬鉄珠【１】, 斬鉄珠【３】 ];
 *     _groupBySlot(decos)
 *     => { '1': [ 攻撃珠【１】, 斬鉄珠【１】 ],
 *          '2': [ 攻撃珠【２】 ],
 *          '3': [ 攻撃珠【３】, 斬鉄珠【３】 ] };
 */
function _groupBySlot(decos) {
    let ret = { 1: [], 2: [], 3: [] };

    if (decos == null || decos.length === 0) return ret;

    for (let i = 0, len = decos.length; i < len; ++i) {
        let deco = decos[i];
        ret[deco.slot].push(deco);
    }

    return ret;
}
exports._groupBySlot = _groupBySlot;

/** 重複ありの組み合わせ(1スロ版) */
function _rcomb1(list) {
    let ret = [];
    for (let i = 0, len = list.length; i < len; ++i) {
        ret.push([ list[i] ]);
    }
    return ret;
}
exports._rcomb1 = _rcomb1;

/** 重複ありの組み合わせ(2スロ版) */
function _rcomb2(list) {
    let ret = [];
    for (let i = 0, len = list.length; i < len; ++i) {
        for (let j = i; j < len; ++j) {
            ret.push([ list[i], list[j] ]);
        }
    }
    return ret;
}
exports._rcomb2 = _rcomb2;

/** 重複ありの組み合わせ(3スロ版) */
function _rcomb3(list) {
    let ret = [];
    for (let i = 0, len = list.length; i < len; ++i) {
        for (let j = i; j < len; ++j) {
            for (let k = j; k < len; ++k) {
                ret.push([ list[i], list[j], list[k] ]);
            }
        }
    }
    return ret;
}
exports._rcomb3 = _rcomb3;
