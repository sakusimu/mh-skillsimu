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
    constructor() {
        this.normalizer = new Normalizer();
        this.combinator = new Combinator();
        this.assembler  = new Assembler();
    }

    /**
     * 条件となるスキルの発動を満たす装飾品の組み合わせを返す。
     */
    simulate(skillNames, equip) {
        if (skillNames == null || skillNames.length === 0) return null;
        if (equip == null) return null;

        let bulksSet = this.normalizer.normalize(skillNames, equip);
        let decombs  = this.combinator.combine(skillNames, bulksSet, equip);
        let assems   = this.assembler.assemble(decombs);

        return assems;
    }
}

module.exports = Simulator;