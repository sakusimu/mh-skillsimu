'use strict';
const data = require('./driver-data');

let model = {};

function make(list, props, numProps) {
    let ret = {};
    for (let i = 0, len = props.length; i < len; ++i) {
        let prop = props[i], value = list[i];
        if (prop === undefined) continue;
        if (numProps[prop]) {
            ret[prop] = (value == null || value === '') ? 0 : +value;
            if (isNaN(ret[prop])) throw new TypeError(prop + ' is NaN');
            continue;
        }
        ret[prop] = value === undefined ? null : value;
    }
    return ret;
}
model.make = make;

function makeSkillComb(model, num) {
    let ret = {};
    for (let i = 1; i <= num; ++i) {
        let tree = model['skillTree' + i], pt = model['skillPt' + i];
        if (tree == null || tree === '') continue;
        ret[tree] = pt;
    }
    return ret;
}
model.makeSkillComb = makeSkillComb;

/**
 * シミュレータのユーザ側クラス。
 * 装備データのクラス。
 */
class Equip {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    /**
     * 引数の equip は以下を要素とする配列。
     * 名前,"性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",レア度,スロット数,入手時期／HR（99=集会場入手不可）,入手時期／村☆（99=村入手不可）,初期防御力,最終防御力,火耐性,水耐性,氷耐性,雷耐性,龍耐性,スキル系統1,スキル値1,スキル系統2,スキル値2,スキル系統3,スキル値3,スキル系統4,スキル値4,スキル系統5,スキル値5,生産素材1,個数,生産素材2,個数,生産素材3,個数,生産素材4,個数
     */
    initialize(equip) {
        equip = equip || [];
        let props = [ 'name', 'sex', 'type', 'rarity', 'slot',
                      'availableHR', 'availableVS', '','','','','','','',
                      'skillTree1', 'skillPt1', 'skillTree2', 'skillPt2',
                      'skillTree3', 'skillPt3', 'skillTree4', 'skillPt4',
                      'skillTree5', 'skillPt5' ];
        let numProps = { sex: true, type: true, slot: true,
                         availableHR: true, availableVS: true,
                         skillPt1: true, skillPt2: true, skillPt3: true,
                         skillPt4: true, skillPt5: true };

        let model = make(equip, props, numProps);
        for (let prop in model) this[prop] = model[prop];

        this.id = [ this.name, this.sex, this.type ].join(',');
    }

    toString() {
        return this.name;
    }

    isEnabled(context) {
        let c = context;

        // 性別(0=両,1=男,2=女): m=[01], w=[02]
        if (c.sex === 'm' && +this.sex !== 0 && +this.sex !== 1) return false;
        if (c.sex === 'w' && +this.sex !== 0 && +this.sex !== 2) return false;

        // タイプ(0=両方,1=剣士,2=ガンナー): k=[01], g=[02]
        if (c.type === 'k' && +this.type !== 0 && +this.type !== 1) return false;
        if (c.type === 'g' && +this.type !== 0 && +this.type !== 2) return false;

        // 入手時期／HR（99=集会場入手不可）,入手時期／村☆（99=村入手不可）
        if (this.availableHR > +c.hr && this.availableVS > +c.vs) return false;

        return true;
    }

    simuData() {
        return {
            name: this.name,
            slot: this.slot,
            skillComb: makeSkillComb(this, 5)
        };
    }
}

class Equips {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    initialize() {
        let equips = {};
        for (let part in data.equips) {
            let list = data.equips[part];
            equips[part] = {};
            for (let i = 0, len = list.length; i < len; ++i) {
                let eq = new Equip(list[i]);
                equips[part][eq.id] = eq;
            }
        }
        this.data = equips;
    }

    /**
     * コンテキスト(性別やタイプなど)をふまえた、装備データを返す。
     * (例えば、女の剣士なら性別は 0 or 2 でタイプは 0 or 1 の装備の集まりとなる)
     */
    enabled(part, context) {
        if (part == null) throw new Error('part is required');
        let equips = this.data[part];
        if (equips == null) throw new Error('unknown part: ' + part);

        let ret = [];
        for (let id in equips) {
            let eq = equips[id];
            if(eq.isEnabled(context)) ret.push(eq);
        }
        return ret;
    }

    get(part, id) {
        if (part == null) throw new Error('part is required');
        if (this.data[part] == null) throw new Error('unknown part: ' + part);
        let eq = this.data[part][id];
        return eq ? eq : null;
    }
}

/**
 * シミュレータのユーザ側にあたるクラス。
 * 装飾品データのクラス。
 */
class Deco {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    /**
     * 引数の deco は以下を要素とする配列。
     * 名前,レア度,スロット,入手時期／HR,入手時期／村☆,スキル系統1,スキル値1,スキル系統2,スキル値2,生産素材A1,個数,生産素材A2,個数,生産素材A3,個数,生産素材A4,個数,生産素材B1,個数,生産素材B2,個数,生産素材B3,個数,生産素材B4,個数
     */
    initialize(deco) {
        deco = deco || [];
        let props = [ 'name', '', 'slot', 'availableHR', 'availableVS',
                      'skillTree1', 'skillPt1', 'skillTree2', 'skillPt2',
                      '','','','','','','','','','','','','','','','' ];
        let numProps = { slot: true, availableHR: true, availableVS: true,
                         skillPt1: true, skillPt2: true };

        let model = make(deco, props, numProps);
        for (let prop in model) this[prop] = model[prop];
    }

    toString() {
        return this.name;
    }

    isEnabled(context) {
        let c = context;

        // 入手時期／HR（99=集会場入手不可）,入手時期／村☆（99=村入手不可）
        if (this.availableHR > +c.hr && this.availableVS > +c.vs) return false;

        return true;
    }

    simuData() {
        return {
            name: this.name,
            slot: this.slot,
            skillComb: makeSkillComb(this, 2)
        };
    }
}

class Decos {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    initialize() {
        let decos = {};
        let list  = data.decos;
        for (let i = 0, len = list.length; i < len; ++i) {
            let deco = new Deco(list[i]);
            decos[deco.name] = deco;
        }
        this.data = decos;
    }

    /**
     * コンテキスト(HRなど)をふまえた、装飾品データを返す。
     */
    enabled(context) {
        let ret = [];
        for (let name in this.data) {
            let deco = this.data[name];
            if(deco.isEnabled(context)) ret.push(deco);
        }
        return ret;
    }

    get(name) {
        let deco = this.data[name];
        return deco ? deco : null;
    }
}

/**
 * シミュレータのユーザ側にあたるクラス。
 * スキルデータのクラス。
 */
class Skill {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    /**
     * 引数の skill は以下を要素とする配列。
     * スキル,スキル系統,ポイント,"タイプ(0=両方, 1=剣士, 2=ガンナー)"
     */
    initialize(skill) {
        skill = skill || [];
        let props = [ 'name', 'tree', 'point', 'type' ];
        let numProps = { point: true, type: true };

        let model = make(skill, props, numProps);
        for (let prop in model) this[prop] = model[prop];
    }

    simuData() {
        return {
            name : this.name,
            tree : this.tree,
            point: this.point
        };
    }
}

class Skills {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    initialize() {
        let skills = {};
        let list   = data.skills;
        for (let i = 0, len = list.length; i < len; ++i) {
            let skill = new Skill(list[i]);
            skills[skill.name] = skill;
        }
        this.data = skills;
    }

    enabled() {
        let ret = [];
        for (let name in this.data) {
            let skill = this.data[name];
            ret.push(skill);
        }
        return ret;
    }

    get(name) {
        let skill = this.data[name];
        return skill ? skill : null;
    }
}

/**
 * シミュレータのユーザ側にあたるクラス。
 * お守りデータのクラス。
 */
class Oma {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    /**
     * 引数の oma は以下を要素とする配列。
     * 名前,スロット数,スキル系統1,スキル値1,スキル系統2,スキル値2
     */
    initialize (oma) {
        oma = oma || [];
        let props = [ 'name', 'slot', 'skillTree1', 'skillPt1', 'skillTree2', 'skillPt2' ];
        let numProps = { slot: true, skillPt1: true, skillPt2: true };

        let model = make(oma, props, numProps);
        for (let prop in model) this[prop] = model[prop];
    }

    toString() {
        let skill1 = skillAsStr(this.skillTree1, this.skillPt1);
        let skill2 = skillAsStr(this.skillTree2, this.skillPt2);

        let summary = [ 'スロ' + this.slot, skill1 ];
        if (skill2 != null) summary.push(skill2);

        return this.name + '(' + summary.join(',') + ')';
    }

    simuData() {
        return {
            name: this.toString(),
            slot: this.slot,
            skillComb: makeSkillComb(this, 2)
        };
    }
}

function skillAsStr(tree, pt) {
    if (tree == null || tree === '') return null;
    pt = +pt;
    let point = pt > 0 ? '+' + pt : '' + pt;
    return tree + point;
}

model.Equip = Equip;
model.Deco  = Deco;
model.Skill = Skill;
model.Oma   = Oma;

model.equips = new Equips();
model.decos  = new Decos();
model.skills = new Skills();

module.exports = model;
