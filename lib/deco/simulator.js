'use strict';
const Normalizer = require('./normalizer');
const Combinator = require('./combinator');
const Assembler = require('./assembler');

/**
 * 装飾品の組み合わせを求めるクラス。
 *
 * ユースケースとして、一度シミュした後の装飾品検索で使われることを想定しているので
 * 前提として、そのスキルが発動する装備の組み合わせはわかっている。
 */
class Simulator {
    constructor(context) {
        this.normalizer = new Normalizer(context);
        this.combinator = new Combinator(context);
        this.assembler  = new Assembler(context);
    }

    /**
     * 条件となるスキルの発動を満たす装飾品の組み合わせを返す。
     */
    simulate(skillnames, equips) {
        if (skillnames == null || skillnames.length === 0) return null;
        if (equips == null) return null;

        let bulksSet = this.normalizer.normalize(skillnames, equips);
        let decombs  = this.combinator.combine(skillnames, bulksSet, equips);
        let assems   = this.assembler.assemble(decombs);

        return assems;
    }
}

module.exports = Simulator;
