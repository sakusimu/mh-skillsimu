'use strict';
const util = require('../util');

/**
 * 部位ごとの装備スロットで実現できる装飾品の組み合わせを正規化するクラス。
 *
 *     let n = new Normalizer(context)
 *     // equip はスキルが発動する装備の組み合わせ
 *     n.normalize([ '斬れ味レベル+1', '砥石使用高速化' ], equip);
 *     => { head: [
 *            { skillComb: { '匠': 0, '研ぎ師': 0 }, decos: [], slot: 0 },
 *            { skillComb: { '匠': 0, '研ぎ師': 2 }, decos: [ '研磨珠【１】' ], slot: 1 },
 *            { skillComb: { '匠': 0, '研ぎ師': 4 },
 *              decos: [ '研磨珠【１】', '研磨珠【１】' ], slot: 2 },
 *            { skillComb: { '匠': 1, '研ぎ師': 0 }, decos: [ '匠珠【２】' ], slot: 2 } ],
 *          body: [
 *            { skillComb: { '匠': 0, '研ぎ師': 0 }, decos: [], slot: 0 },
 *            { skillComb: { '匠': 0, '研ぎ師': 2 }, decos: [ '研磨珠【１】' ], slot: 1 },
 *            { skillComb: { '匠': 0, '研ぎ師': 4 },
 *              decos: [ '研磨珠【１】', '研磨珠【１】' ], slot: 2 },
 *            { skillComb: { '匠': 1, '研ぎ師': 0 }, decos: [ '匠珠【２】' ], slot: 2 },
 *            { skillComb: { '匠': 0, '研ぎ師': 6 },
 *              decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ], slot: 3,  },
 *            ... ],
 *          arm   : [ ... ],
 *          waist : [ ... ],
 *          leg   : [ ... ],
 *          weapon: [ ... ],
 *          charm : [ ... ] }
 *
 * データについて
 * * bulk  正規化した結果の、スキルの組み合わせと装飾品をまとめたもの
 *   e.g.
 *     { skillComb: { '匠': 0, '研ぎ師': 2 }, decos: [ '研磨珠【１】' ], slot: 1 },
 *
 * * bulksSet  bulk の配列を部位ごとにもつデータ
 *   e.g.
 *     { head: [ bulk, ... ], body: [ bulk, ... ], ... }
 */
class Normalizer {
    constructor(context) {
        if (context == null) throw new Error('context is required');
        this.context = context;
    }

    normalize(skillNames, equip) {
        if (skillNames == null || skillNames.length === 0) return null;
        if (equip == null) return null;

        let skillTrees = util.skill.trees(this.context.skills, skillNames);
        if (skillTrees.length === 0) return null;

        let decoCombsBySlot = util.deco.combs(this.context.decos, skillTrees);

        let bulksSet = {};
        for (let i = 0, len = parts.length; i < len; ++i) {
            let part = parts[i];
            let eq = equip[part];

            let bulks;
            bulks = this._normalize1(decoCombsBySlot, eq);
            bulks = this._normalize2(bulks, skillTrees);

            bulksSet[part] = bulks;
        }

        return bulksSet;
    }

    /**
     * 装飾品の組み合わせを作成。
     */
    _normalize1(decoCombsBySlot, equip) {
        if (equip == null) return [];

        let maxSlot = equip.slot;
        let sc = equip.skillComb;

        let bulks = [ makeBulk(null, 0, sc) ];

        for (let slot = 1; slot <= maxSlot; ++slot) {
            let decoCombs = decoCombsBySlot[slot];
            for (let i = 0, ilen = decoCombs.length; i < ilen; ++i) {
                let decoComb = decoCombs[i];
                let bulk = makeBulk(decoComb, slot, sc);
                bulks.push(bulk);
            }
        }

        return bulks;
    }

    /**
     * 条件のスキル系統のみで構成されたスキルの組み合わせにする(関係のないスキルは省く)
     */
    _normalize2(bulks, skillTrees) {
        for (let i = 0, len = bulks.length; i < len; ++i) {
            let bulk = bulks[i];
            bulk.skillComb = util.skill.compact(skillTrees, bulk.skillComb);
        }
        return bulks;
    }
}

const parts = util.parts;

function makeBulk(decoComb, slot, skillComb) {
    let sc = skillComb || {};

    let bulk = {
        decos: [],
        slot: slot || 0,
        skillComb: util.skill.hasTorsoUp(sc) ? sc : {}
    };

    if (decoComb == null) return bulk;

    let decos = [],
        skillCombs = [ bulk.skillComb ];
    for (let i = 0, len = decoComb.length; i < len; ++i) {
        decos.push(decoComb[i].name);
        skillCombs.push(decoComb[i].skillComb);
    }

    bulk.decos = decos;
    bulk.skillComb = util.skill.join(skillCombs);

    return bulk;
}

module.exports = Normalizer;
