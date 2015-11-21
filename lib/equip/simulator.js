'use strict';
const Normalizer = require('./normalizer');
const Combinator = require('./combinator');
const Assembler = require('./assembler');

class Simulator {
    constructor(context) {
        this.normalizer = new Normalizer(context);
        this.combinator = new Combinator(context);
        this.assembler  = new Assembler(context);
    }

    simulate(skillnames) {
        let bulksSet = this.normalizer.normalize(skillnames);
        let eqcombs  = this.combinator.combine(skillnames, bulksSet);
        let assems   = this.assembler.assemble(eqcombs);
        return assems;
    }
}

module.exports = Simulator;
