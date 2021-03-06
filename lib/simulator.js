'use strict';
const Context = require('./context');
const EquipSimulator = require('./equip/simulator');
const DecoSimulator  = require('./deco/simulator');

class Simulator {
    constructor() {
        this._context = new Context();
        this._equip = new EquipSimulator(this._context);
        this._deco  = new DecoSimulator(this._context);

        this.init.apply(this, arguments);
    }

    init(data) {
        // data: { equips, decos, skills }
        this._context.init(data);
    }

    simulateEquip(skillnames) {
        return this._equip.simulate(skillnames);
    }

    simulateDeco(skillnames, equips) {
        return this._deco.simulate(skillnames, equips);
    }
}

module.exports = Simulator;
