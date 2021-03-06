'use strict';
const load = require('./data-loader.js');
const Hunter = require('./hunter');
const model = require('./model');
const simudata = require('./simudata');
const parts = require('../../lib/util').parts;

function createMyApp(series) {
    return new MyApp(series);
}
exports = module.exports = createMyApp;

/**
 * シミュレータのユーザ側クラス。
 * アプリを表すクラス。
 */
class MyApp {
    constructor(series) {
        if(series == null) throw new Error('series is require');

        this.rawdata = load(series);
        if (this.rawdata == null) throw new Error(`unknown series: ${series}`);

        this._equipIndexes = MyApp.makeEquipIndexes(this.rawdata.equips);

        this.init.apply(this, arguments);
    }

    init() {
        this.data = {};
        this.hunter = new Hunter();
        this.setup();
    }

    setup(opts) {
        opts = opts || {};

        this.hunter.init(opts.hunter);

        let equips = {};
        parts.forEach(part => equips[part] = []);

        let armors = [ 'head', 'body', 'arm', 'waist', 'leg' ];
        armors.forEach(part => {
            equips[part] = simudata.equips(this.rawdata.equips[part], this.hunter);
        });

        if (opts.weaponSlot != null) {
            let wslot  = opts.weaponSlot;
            let weapon = { name: 'slot' + wslot, slot: wslot, skills: {} };
            equips.weapon = [ weapon ];
        }

        let decos = simudata.decos(this.rawdata.decos, this.hunter);

        let skills = simudata.skills(this.rawdata.skills);

        if (opts.charms) {
            equips.charm = simudata.charms(opts.charms);
        }

        if (opts.dig) {
            let weapons = simudata.digs(this.rawdata.digs.weapon, this.hunter);
            equips.weapon = equips.weapon.concat(weapons);
            armors.forEach(part => {
                let digs = simudata.digs(this.rawdata.digs[part], this.hunter);
                equips[part] = equips[part].concat(digs);
            });
        }

        this.data = {
            equips: equips,
            decos : decos,
            skills: skills
        };
    }

    static makeEquipIndexes(rawdataEquips) {
        let indexes = {};
        Object.keys(rawdataEquips || {}).forEach(part => {
            let idxs = indexes[part] = {};
            (rawdataEquips[part] || [])
                .map(rawdata => new model.Equip(rawdata))
                .forEach(eq => idxs[genId(eq)] = eq.simudata());
        });
        return indexes;
    }

    equip(part, name) {
        if (part == null) throw new Error('part is required');
        if (name == null) throw new Error('name is required');

        let sex = this.hunter.sex === 'm' ? 1 : 2;
        let type = this.hunter.type === 'k' ? 1 : 2;

        let equips = this._equipIndexes[part];
        if (equips == null) return null;

        let id = _genId(name, 0, 0);
        if (equips[id]) return equips[id];
        id = _genId(name, 0, type);
        if (equips[id]) return equips[id];

        id = _genId(name, sex, 0);
        if (equips[id]) return equips[id];
        id = _genId(name, sex, type);
        if (equips[id]) return equips[id];

        return null;
    }

    static charm(list) {
        let ch = new model.Charm(list);
        return ch ? ch.simudata() : null;
    }
    charm() { return MyApp.charm.apply(MyApp, arguments); }
}
exports.MyApp = MyApp;

function genId(equip) {
    return _genId(equip.name, equip.sex, equip.type);
}
function _genId(name, sex, type) {
    return `${name},${sex},${type}`;
}
