'use strict';
const EquipSimulator = require('./equip/simulator');
const DecoSimulator  = require('./deco/simulator');

class Simulator {
    constructor() {
        this.initialize();
    }

    initialize() {
        this._equip = new EquipSimulator();
        this._deco  = new DecoSimulator();
    }

    simulateEquip(skillNames, opts) {
        return this._equip.simulate(skillNames, opts);
    }

    simulateDeco(skillNames, equips) {
        return this._deco.simulate(skillNames, equips);
    }
}

module.exports = Simulator;
