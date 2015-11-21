'use strict';
const util = require('../util');

const parts = util.parts;

/**
 * 部位ごとの装備スロットで実現できる装飾品の組み合わせを正規化するクラス。
 *
 *     let n = new Normalizer(context)
 *     // equip はスキルが発動する装備の組み合わせ
 *     n.normalize([ '斬れ味レベル+1', '砥石使用高速化' ], equip);
 *     => { head: [
 *            { skills: { '匠': 0, '研ぎ師': 0 }, decos: [], slot: 0 },
 *            { skills: { '匠': 0, '研ぎ師': 2 }, decos: [ '研磨珠【１】' ], slot: 1 },
 *            { skills: { '匠': 0, '研ぎ師': 4 },
 *              decos: [ '研磨珠【１】', '研磨珠【１】' ], slot: 2 },
 *            { skills: { '匠': 1, '研ぎ師': 0 }, decos: [ '匠珠【２】' ], slot: 2 } ],
 *          body: [
 *            { skills: { '匠': 0, '研ぎ師': 0 }, decos: [], slot: 0 },
 *            { skills: { '匠': 0, '研ぎ師': 2 }, decos: [ '研磨珠【１】' ], slot: 1 },
 *            { skills: { '匠': 0, '研ぎ師': 4 },
 *              decos: [ '研磨珠【１】', '研磨珠【１】' ], slot: 2 },
 *            { skills: { '匠': 1, '研ぎ師': 0 }, decos: [ '匠珠【２】' ], slot: 2 },
 *            { skills: { '匠': 0, '研ぎ師': 6 },
 *              decos: [ '研磨珠【１】', '研磨珠【１】', '研磨珠【１】' ], slot: 3,  },
 *            ... ],
 *          arm   : [ ... ],
 *          waist : [ ... ],
 *          leg   : [ ... ],
 *          weapon: [ ... ],
 *          charm : [ ... ] }
 *
 * データについて
 * * bulk  正規化した結果の、装飾品とスキルをまとめたもの
 *   e.g.
 *       { skills: { '匠': 0, '研ぎ師': 2 }, decos: [ '研磨珠【１】' ], slot: 1 },
 *
 * * bulksSet  bulk の配列を部位ごとにもつデータ
 *   e.g.
 *       { head: [ bulk, ... ], body: [ bulk, ... ], ... }
 */
class Normalizer {
    constructor(context) {
        if (context == null) throw new Error('context is required');
        this.context = context;
    }

    normalize(skillnames, equip) {
        if (skillnames == null || skillnames.length === 0) return null;
        if (equip == null) return null;

        let skilltrees = util.skill.trees(this.context.skills, skillnames);
        if (skilltrees.length === 0) return null;

        let decosCombBySlot = util.deco.combs(this.context.decos, skilltrees);

        let bulksSet = {};
        for (let i = 0, len = parts.length; i < len; ++i) {
            let part = parts[i];
            let eq = equip[part];

            let bulks;
            bulks = this._normalize1(decosCombBySlot, eq);
            bulks = this._normalize2(bulks, skilltrees);

            bulksSet[part] = bulks;
        }

        return bulksSet;
    }

    /**
     * 装飾品の組み合わせを作成。
     */
    _normalize1(decosCombBySlot, equip) {
        if (equip == null) return [];

        let maxSlot = equip.slot;
        let skills = equip.skills;

        let bulks = [ makeBulk(null, 0, skills) ];

        for (let slot = 1; slot <= maxSlot; ++slot) {
            let decosComb = decosCombBySlot[slot];
            for (let i = 0, ilen = decosComb.length; i < ilen; ++i) {
                let decos = decosComb[i];
                let bulk = makeBulk(decos, slot, skills);
                bulks.push(bulk);
            }
        }

        return bulks;
    }

    /**
     * 条件のスキル系統のみで構成されたスキルにする(関係のないスキルは省く)
     */
    _normalize2(bulks, skilltrees) {
        for (let i = 0, len = bulks.length; i < len; ++i) {
            let bulk = bulks[i];
            bulk.skills = util.skill.compact(skilltrees, bulk.skills);
        }
        return bulks;
    }
}

function makeBulk(decos, slot, skills) {
    skills = skills || {};

    let bulk = {
        decos: [],
        slot: slot || 0,
        skills: util.skill.hasTorsoUp(skills) ? skills : {}
    };

    if (decos == null) return bulk;

    let dcnames = [];
    let skillsComb = [ bulk.skills ];
    for (let i = 0, len = decos.length; i < len; ++i) {
        dcnames.push(decos[i].name);
        skillsComb.push(decos[i].skills);
    }

    bulk.decos = dcnames;
    bulk.skills = util.skill.join(skillsComb);

    return bulk;
}

module.exports = Normalizer;
