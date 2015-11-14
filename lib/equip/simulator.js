'use strict';
const Normalizer = require('./normalizer');
const Combinator = require('./combinator');
const Assembler = require('./assembler');

class Simulator {
    constructor() {
        this.normalizer = new Normalizer();
        this.combinator = new Combinator();
        this.assembler  = new Assembler();
    }

    simulate(skillNames) {
        this.normalizer.initialize();

        let bulksSet = this.normalizer.normalize(skillNames);
        let eqcombs  = this.combinator.combine(skillNames, bulksSet);
        let assems   = this.assembler.assemble(eqcombs);

        return assems;
    }
}

module.exports = Simulator;
