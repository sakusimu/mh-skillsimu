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

class Digs {
    constructor() {
        this.data = {};
        this.init.apply(this, arguments);
    }

    init(digs) {
        let data = {};
        for (let part in digs) {
            let list = digs[part] || [];
            data[part] = {};
            for (let i = 0, len = list.length; i < len; ++i) {
                let dig = new Dig(list[i]);
                data[part][dig.name] = dig;
            }
        }
        this.data = data;
    }

    enabled(part, hunter) {
        if (part == null) throw new Error('part is required');

        let digs = this.data[part];
        if (digs == null) return [];

        let ret = [];
        for (let id in digs) {
            let dig = digs[id];
            if(dig.isEnabled(hunter)) ret.push(dig);
        }
        return ret;
    }

    get(part, name) {
        if (part == null) throw new Error('part is required');
        if (this.data[part] == null) return null;
        let dig = this.data[part][name];
        return dig ? dig : null;
    }
}

model.Dig = Dig;
model.Digs = Digs;

module.exports = model;
