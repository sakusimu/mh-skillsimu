'use strict';
const Context = require('./driver-context');
const model = require('./driver-model');
const data = require('../../../lib/data');
require('./driver-dig');

/**
 * シミュレータのユーザ側クラス。
 * アプリを表すクラス。
 */
class MyApp {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    initialize() {
        this.context = new Context();
        this.setup();
    }

    setup(opts) {
        opts = opts || {};

        this.context.initialize(opts.context);

        const simuData = obj => obj.simuData();

        let equips = {};
        data.parts.forEach(part => equips[part] = []);

        let armors = [ 'head', 'body', 'arm', 'waist', 'leg' ];
        armors.forEach(part => {
            let list = model.equips.enabled(part, this.context);
            equips[part] = list.map(simuData);
        });

        if (opts.weaponSlot != null) {
            let wslot  = opts.weaponSlot;
            let weapon = { name: 'slot' + wslot, slot: wslot, skillComb: {} };
            equips.weapon = [ weapon ];
        }

        if (opts.omas) {
            equips.oma = [];
            opts.omas.forEach(list => {
                let oma = new model.Oma(list);
                equips.oma.push(oma.simuData());
            });
        }

        if (opts.dig) {
            let weapons = model.digs.enabled('weapon', this.context).map(simuData);
            equips.weapon = equips.weapon.concat(weapons);
            armors.forEach(part => {
                let list = model.digs.enabled(part, this.context);
                equips[part] = equips[part].concat(list.map(simuData));
            });
        }

        let decos = model.decos.enabled(this.context).map(simuData);

        let skills = {};
        model.skills.enabled().forEach(s => skills[s.name] = s.simuData());

        data.set({
            equips: equips,
            decos : decos,
            skills: skills
        });
    }

    equip(part, name) {
        let equips = model.equips;
        let sex  = this.context.sex === 'm' ? 1 : 2;
        let type = this.context.type === 'k' ? 1 : 2;

        let id = [ name, 0, 0 ].join(',');
        let eq = equips.get(part, id);
        if (eq) return eq.simuData();

        id = [ name, 0, type ].join(',');
        eq = equips.get(part, id);
        if (eq) return eq.simuData();

        id = [ name, sex, 0 ].join(',');
        eq = equips.get(part, id);
        if (eq) return eq.simuData();

        id = [ name, sex, type ].join(',');
        eq = equips.get(part, id);
        if (eq) return eq.simuData();

        return null;
    }

    oma(list) {
        let oma = new model.Oma(list);
        return oma ? oma.simuData() : null;
    }
}

let myapp = new MyApp();
module.exports = myapp;
