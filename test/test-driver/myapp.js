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
        if(series == null) throw new Error(`series is require`);

        this.rawdata = load(series);
        if (this.rawdata == null) throw new Error(`unknown series: ${series}`);

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

    static equip(rawdata) {
        let eq = new model.Equip(rawdata);
        return eq.simudata();
    }
    equip() { return MyApp.equip.apply(MyApp, arguments); }

    static charm(list) {
        let ch = new model.Charm(list);
        return ch ? ch.simudata() : null;
    }
    charm() { return MyApp.charm.apply(MyApp, arguments); }
}
exports.MyApp = MyApp;
