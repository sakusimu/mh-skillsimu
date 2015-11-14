'use strict';
const data = require('../data');
const util = require('./skill');

/**
 * スキル系統にマッチする装飾品を抽出。
 * (スキル系統のポイント > 0 のものにしぼる)
 */
exports.filter = skillTrees => {
    if (skillTrees == null || skillTrees.length === 0) return [];

    let decos = data.decos;
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
};

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
 *     skillCombs([ '攻撃', '斬れ味' ]);
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
exports.skillCombs = skillTrees => {
    if (skillTrees == null || skillTrees.length === 0) return [];

    let decoCombs = this.combs(skillTrees);
    let ret = [];

    for (let i = 0, ilen = decoCombs.length; i < ilen; ++i) {
        let decosList = decoCombs[i];
        let merges = [];
        for (let j = 0, jlen = decosList.length; j < jlen; ++j) {
            let decos = decosList[j];
            let combs = [];
            for (let k = 0, klen = decos.length; k < klen; ++k) {
                combs.push(decos[k].skillComb);
            }
            merges.push(util.join(combs));
        }
        ret.push(merges);
    }

    return ret;
};

/**
 * 引数のスキル系統を元に、対象となる装飾品で実現できる
 * 装飾品の組み合わせを返す。
 *
 * e.g.
 *     combs([ '攻撃', '斬れ味' ]);
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
exports.combs = skillTrees => {
    if (skillTrees == null || skillTrees.length === 0) return [];

    let decos = this.filter(skillTrees);

    decos = this._groupBySlot(decos);

    let slot0 = [];
    let slot1 = this._rcomb1(decos[1]);

    let slot2 = this._rcomb2(decos[1]);
    slot2 = slot2.concat(this._rcomb1(decos[2]));

    let slot3 = this._rcomb3(decos[1]);
    if (decos[1].length) {
        for (let i = 0, ilen = decos[2].length; i < ilen; ++i) {
            let d2 = decos[2][i];
            for (let j = 0, jlen = decos[1].length; j < jlen; ++j) {
                let d1 = decos[1][j];
                slot3.push([ d2, d1 ]);
            }
        }
    } else {
        slot3 = slot3.concat(this._rcomb1(decos[2]));
    }
    slot3 = slot3.concat(this._rcomb1(decos[3]));

    return [ slot0, slot1, slot2, slot3 ];
};

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
exports._groupBySlot = decos => {
    let ret = { 1: [], 2: [], 3: [] };

    if (decos == null || decos.length === 0) return ret;

    for (let i = 0, len = decos.length; i < len; ++i) {
        let deco = decos[i];
        ret[deco.slot].push(deco);
    }

    return ret;
};

/** 重複ありの組み合わせ(1スロ版) */
exports._rcomb1 = list => {
    let ret = [];
    for (let i = 0, len = list.length; i < len; ++i) {
        ret.push([ list[i] ]);
    }
    return ret;
};

/** 重複ありの組み合わせ(2スロ版) */
exports._rcomb2 = list => {
    let ret = [];
    for (let i = 0, len = list.length; i < len; ++i) {
        for (let j = i; j < len; ++j) {
            ret.push([ list[i], list[j] ]);
        }
    }
    return ret;
};

/** 重複ありの組み合わせ(3スロ版) */
exports._rcomb3 = list => {
    let ret = [];
    for (let i = 0, len = list.length; i < len; ++i) {
        for (let j = i; j < len; ++j) {
            for (let k = j; k < len; ++k) {
                ret.push([ list[i], list[j], list[k] ]);
            }
        }
    }
    return ret;
};
