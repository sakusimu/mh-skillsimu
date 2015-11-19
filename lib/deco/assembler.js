'use strict';
const util = require('../util');

/**
 * 発動条件を満たす装飾品の組み合わせを元に、結果を組み立てるクラス。
 *
 *     let skills = [ '斬れ味レベル+1', '高級耳栓' ];
 *     let equip = {
 *         head  : ユクモノカサ・天,
 *         body  : 三眼の首飾り,
 *         arm   : ユクモノコテ・天,
 *         waist : バンギスコイル,
 *         leg   : ユクモノハカマ・天,
 *         weapon: slot2,
 *         charm : 龍の護石(スロ3,匠+4,氷耐性-5)
 *     };
 *     let n = new Normalizer(context);
 *     let bulksSet = n.normalize(skills, equip);
 *     let c = new Combinator(context);
 *     let decombs = c.combine(skills, bulksSet, equip);
 *     let a = new Assembler(context);
 *     a.assemble(decombs);
 *     => [ // all = torsoUp + rest
 *            { all: [ '防音珠【３】', '防音珠【１】', '防音珠【１】', '防音珠【１】',
 *                     '防音珠【１】', '防音珠【１】', '防音珠【１】', '防音珠【１】',
 *                     '匠珠【３】' ],
 *              torsoUp: [ '防音珠【３】' ],
 *              rest: [ '防音珠【１】', '防音珠【１】', '防音珠【１】', '防音珠【１】',
 *                      '防音珠【１】', '防音珠【１】', '防音珠【１】', '匠珠【３】' ] },
 *            ...
 *     ]
 *
 * データについて
 * * assem  スキルが発動する装飾品のセット
 *   { all: [ '防音珠【３】', '防音珠【１】', '防音珠【１】', '防音珠【１】',
 *            '防音珠【１】', '防音珠【１】', '防音珠【１】', '防音珠【１】',
 *            '匠珠【３】' ],
 *     torsoUp: [ '防音珠【３】' ],
 *     rest: [ '防音珠【１】', '防音珠【１】', '防音珠【１】', '防音珠【１】',
 *             '防音珠【１】', '防音珠【１】', '防音珠【１】', '匠珠【３】' ] }
 */
class Assembler {
    constructor(context) {
        if (context == null) throw new Error('context is required');
        this.context = context;
    }

    assemble(decombs) {
        if (decombs == null || decombs.length === 0) return [];

        let hasTorsoUp = this._checkTorsoUp(decombs);

        let ret = [];
        for (let i = 0, len = decombs.length; i < len; ++i) {
            let decomb = decombs[i];
            let all = [], torsoUp = [], rest = []; // all = torsoUp + rest

            for (let part in decomb) {
                let comb = decomb[part];
                if (comb == null) continue;
                let names = comb.decos;
                all = all.concat(names);
                if (hasTorsoUp && part !== 'body') rest = rest.concat(names);
                if (hasTorsoUp && part === 'body') torsoUp = torsoUp.concat(names);
            }

            if (!hasTorsoUp) rest = all.concat();
            let assem = { all: all, torsoUp: torsoUp, rest: rest };
            ret.push(assem);
        }
        return ret;
    }

    _checkTorsoUp(decombs) {
        for (let i = 0, len = decombs.length; i < len; ++i) {
            let decomb = decombs[i];
            for (let part in decomb) {
                let comb = decomb[part];
                if (comb == null) continue;
                if (util.skill.hasTorsoUp(comb.skillComb)) return true;
            }
        }
        return false;
    }
}

module.exports = Assembler;
