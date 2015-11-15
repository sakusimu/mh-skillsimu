'use strict';
const model = require('./driver-model');

/**
 * シミュレータのユーザ側にあたるクラス。
 * 発掘装備のクラス。
 */
class Dig {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    /**
     * 引数の dig は以下を要素とする配列。
     * "性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",スキル系統1,スキル値1
     */
    initialize(dig) {
        dig = dig || [];
        let props = [ 'sex', 'type', 'skillTree1', 'skillPt1' ];
        let numProps = { sex: true, type: true, skillPt1: true };

        let obj = model.make(dig, props, numProps);
        for (let prop in obj) this[prop] = obj[prop];

        this.name = '発掘' + '(' + this.skillTree1 + '+' + this.skillPt1 + ')';
        this.slot = 0;
    }

    toString() {
        return this.name;
    }

    isEnabled(hunter) {
        let h = hunter;

        // タイプ(0=両方,1=剣士,2=ガンナー): k=[01], g=[02]
        if (h.type === 'k' && +this.type !== 0 && +this.type !== 1) return false;
        if (h.type === 'g' && +this.type !== 0 && +this.type !== 2) return false;

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

class Digs {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    initialize() {
        this.data = {};
        this.data.weapon = makeWeapons();
        let armors = makeArmors();
        this.data.head = makeArmors({ type: 0 });
        this.data.body = armors;
        this.data.arm  = armors;
        this.data.waist = armors;
        this.data.leg  = armors;
    }

    enabled(part, hunter) {
        if (part == null) throw new Error('part is required');
        let digs = this.data[part];
        if (digs == null) throw new Error('unknown part: ' + part);

        let ret = [];
        for (let id in digs) {
            let dig = digs[id];
            if(dig.isEnabled(hunter)) ret.push(dig);
        }
        return ret;
    }

    get(part, name) {
        if (part == null) throw new Error('part is required');
        if (this.data[part] == null) throw new Error('unknown part: ' + part);
        let dig = this.data[part][name];
        return dig ? dig : null;
    }
}

function makeWeapons() {
    let assets = {
        '刀匠': { pt: [2,3,4], type: 1 },
        '状耐': { pt: [2,3,4], type: 1 },
        '回避': { pt: [3,4,5], type: 1 },
        '射手': { pt: [2,3,4], type: 2 },
        '怒'  : { pt: [2,3,4], type: 2 },
        '頑強': { pt: [3,4,5], type: 2 },
        '強欲': { pt: [3,4,6], type: 0 },
        '護収': { pt: [3,4,6], type: 0 }
    };

    let weapons = {};
    for (let tree in assets) {
        let a = assets[tree];
        for (let i = 0, len = a.pt.length; i < len; ++i) {
            let dig = new Dig([ 0, a.type, tree, a.pt[i] ]);
            weapons[dig.name] = dig;
        }
    }

    return weapons;
}

function makeArmors(args) {
    args = args || {};

    let assets = {
        '刀匠': { pt: [2,3], type: 1 },
        '状耐': { pt: [2,3], type: 1 },
        '回避': { pt: [2,3,4], type: 1 },
        '居合': { pt: [2,3,4], type: 1 },
        '射手': { pt: [2,3], type: 2 },
        '怒'  : { pt: [2,3], type: 2 },
        '頑強': { pt: [2,3,4], type: 2 },
        '剛撃': { pt: [2,3,4], type: 2 },
        '盾持': { pt: [2,3,4], type: 0 },
        '増幅': { pt: [2,3,4], type: 0 },
        '潔癖': { pt: [2,3,4], type: 0 },
        '一心': { pt: [2,3,4], type: 0 },
        '強欲': { pt: [2,3], type: 0 },
        '護収': { pt: [2,3], type: 0 }
    };

    let armors = {};
    for (let tree in assets) {
        let a = assets[tree];
        let type = args.type == null ? a.type : args.type;
        for (let i = 0, len = a.pt.length; i < len; ++i) {
            let dig = new Dig([ 0, type, tree, a.pt[i] ]);
            armors[dig.name] = dig;
        }
    }

    return armors;
}

model.Dig = Dig;
model.digs = new Digs();

module.exports = model;
