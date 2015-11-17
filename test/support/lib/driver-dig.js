'use strict';
const model = require('./driver-model');

/**
 * 発掘装備のクラス。
 */
class Dig {
    constructor(data) {
        let obj = model.makeObject(Dig.columns, data, Dig.numColumns);
        for (let prop in obj) this[prop] = obj[prop];
        this.name = '発掘' + '(' + this.skillTree1 + '+' + this.skillPt1 + ')';
        this.slot = 0;
    }

    isEnabled(hunter) {
        let h = hunter;

        // タイプ(0=両方,1=剣士,2=ガンナー): k=[01], g=[02]
        if (h.type === 'k' && this.type !== 0 && this.type !== 1) return false;
        if (h.type === 'g' && this.type !== 0 && this.type !== 2) return false;

        return true;
    }

    simuData() {
        return {
            name: this.name,
            slot: this.slot,
            skillComb: model.makeSkillComb(this, 1)
        };
    }
}

// "性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",スキル系統1,スキル値1
Dig.columns = [ 'sex', 'type', 'skillTree1', 'skillPt1' ];
Dig.numColumns = { sex: true, type: true, skillPt1: true };
Dig.props = [ 'name', 'sex', 'type', 'slot', 'skillTree1', 'skillPt1' ];

model.Dig = Dig;

module.exports = model;
