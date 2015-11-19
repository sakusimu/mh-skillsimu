'use strict';

/**
 * シミュレータのユーザ側モデル。
 */
let model = {};

function makeObject(props, values, numProps) {
    values = values || [];
    numProps = numProps || {};

    let obj = {};
    for (let i = 0, len = props.length; i < len; ++i) {
        let prop = props[i], value = values[i];
        if (prop == null || prop === '') continue;

        value = value === undefined ? null : value;

        if (numProps[prop]) {
            value = (value == null || value === '') ? 0 : +value;
            if (isNaN(value)) throw new TypeError(prop + ' is NaN');
        }

        obj[prop] = value;
    }
    return obj;
}
model.makeObject = makeObject;

function makeSkillComb(data, num) {
    if (data == null) return null;
    num = num || 10;
    let sc = {};
    for (let i = 1; i <= num; ++i) {
        let tree = data['skillTree' + i], pt = data['skillPt' + i];
        if (tree == null || tree === '') continue;
        sc[tree] = pt;
    }
    return sc;
}
model.makeSkillComb = makeSkillComb;

/**
 * 装備データのクラス。
 */
class Equip {
    constructor(data) {
        let obj = makeObject(Equip.columns, data, Equip.numColumns);
        for (let prop in obj) this[prop] = obj[prop];
    }

    isEnabled(hunter) {
        let h = hunter;

        // 性別(0=両,1=男,2=女): m=[01], w=[02]
        if (h.sex === 'm' && this.sex !== 0 && this.sex !== 1) return false;
        if (h.sex === 'w' && this.sex !== 0 && this.sex !== 2) return false;

        // タイプ(0=両方,1=剣士,2=ガンナー): k=[01], g=[02]
        if (h.type === 'k' && this.type !== 0 && this.type !== 1) return false;
        if (h.type === 'g' && this.type !== 0 && this.type !== 2) return false;

        // 入手時期／HR（99=集会場入手不可）,入手時期／村☆（99=村入手不可）
        if (this.availableHR > h.hr && this.availableVS > h.vs) return false;

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

// 名前,"性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",レア度,スロット数,入手時期／HR（99=集会場入手不可）,入手時期／村☆（99=村入手不可）,初期防御力,最終防御力,火耐性,水耐性,氷耐性,雷耐性,龍耐性,スキル系統1,スキル値1,スキル系統2,スキル値2,スキル系統3,スキル値3,スキル系統4,スキル値4,スキル系統5,スキル値5,生産素材1,個数,生産素材2,個数,生産素材3,個数,生産素材4,個数
Equip.columns = [ 'name', 'sex', 'type', 'rarity', 'slot',
                  'availableHR', 'availableVS', '','','','','','','',
                  'skillTree1', 'skillPt1', 'skillTree2', 'skillPt2',
                  'skillTree3', 'skillPt3', 'skillTree4', 'skillPt4',
                  'skillTree5', 'skillPt5' ];
Equip.numColumns = { sex: true, type: true, slot: true,
                     availableHR: true, availableVS: true,
                     skillPt1: true, skillPt2: true, skillPt3: true,
                     skillPt4: true, skillPt5: true };
Equip.props = Equip.columns.filter(col => col !== '');

/**
 * 装飾品データのクラス。
 */
class Deco {
    constructor(data) {
        let obj = makeObject(Deco.columns, data, Deco.numColumns);
        for (let prop in obj) this[prop] = obj[prop];
    }

    isEnabled(hunter) {
        let h = hunter;

        // 入手時期／HR（99=集会場入手不可）,入手時期／村☆（99=村入手不可）
        if (this.availableHR > h.hr && this.availableVS > h.vs) return false;

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

// 名前,レア度,スロット,入手時期／HR,入手時期／村☆,スキル系統1,スキル値1,スキル系統2,スキル値2,生産素材A1,個数,生産素材A2,個数,生産素材A3,個数,生産素材A4,個数,生産素材B1,個数,生産素材B2,個数,生産素材B3,個数,生産素材B4,個数
Deco.columns = [ 'name', '', 'slot', 'availableHR', 'availableVS',
                 'skillTree1', 'skillPt1', 'skillTree2', 'skillPt2' ];
Deco.numColumns = { slot: true, availableHR: true, availableVS: true,
                    skillPt1: true, skillPt2: true };
Deco.props = Deco.columns.filter(col => col !== '');

/**
 * スキルデータのクラス。
 */
class Skill {
    constructor(data) {
        let obj = makeObject(Skill.columns, data, Skill.numColumns);
        for (let prop in obj) this[prop] = obj[prop];
    }
    simuData() {
        return { name: this.name, tree: this.tree, point: this.point };
    }
}

// スキル,スキル系統,ポイント,"タイプ(0=両方, 1=剣士, 2=ガンナー)"
Skill.columns = [ 'name', 'tree', 'point', 'type' ];
Skill.numColumns = { point: true, type: true };
Skill.props = Skill.columns.filter(col => col !== '');

/**
 * お守りデータのクラス。
 */
class Charm {
    constructor(data) {
        let obj = makeObject(Charm.columns, data, Charm.numColumns);
        for (let prop in obj) this[prop] = obj[prop];
    }

    static skillAsStr(tree, pt) {
        if (tree == null || tree === '') return null;
        pt = +pt;
        let point = pt > 0 ? '+' + pt : '' + pt;
        return tree + point;
    }

    toString() {
        let skill1 = Charm.skillAsStr(this.skillTree1, this.skillPt1);
        let skill2 = Charm.skillAsStr(this.skillTree2, this.skillPt2);

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

// 名前,スロット数,スキル系統1,スキル値1,スキル系統2,スキル値2
Charm.columns = [ 'name', 'slot', 'skillTree1', 'skillPt1', 'skillTree2', 'skillPt2' ];
Charm.numColumns = { slot: true, skillPt1: true, skillPt2: true };
Charm.props = Charm.columns.filter(col => col !== '');

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

model.Equip = Equip;
model.Deco  = Deco;
model.Skill = Skill;
model.Charm = Charm;
model.Dig = Dig;

module.exports = model;
