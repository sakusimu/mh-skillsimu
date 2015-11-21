'use strict';
const model = require('./model');

exports.equips = function equips(rawdataEquips, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let ret = (rawdataEquips || [])
            .map(cols => new model.Equip(cols))
            .filter(eq => eq.isEnabled(hunter))
            .map(eq => eq.simudata());
    return ret;
};

exports.decos = function decos(rawdataDecos, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let ret = (rawdataDecos || [])
            .map(cols => new model.Deco(cols))
            .filter(deco => deco.isEnabled(hunter))
            .map(deco => deco.simudata());
    return ret;
};

exports.skills = function skills(rawdataSkills) {
    let ret = {};
    (rawdataSkills || []).forEach(cols => {
        let skill = new model.Skill(cols);
        ret[skill.name] = skill.simudata();
    });
    return ret;
};

exports.charms = function charms(rawdataCharms) {
    let ret = (rawdataCharms || [])
            .map(cols => new model.Charm(cols))
            .map(charm => charm.simudata());
    return ret;
};

exports.digs = function digs(rawdataDigs, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let ret = (rawdataDigs || [])
            .map(cols => new model.Dig(cols))
            .filter(dig => dig.isEnabled(hunter))
            .map(dig => dig.simudata());
    return ret;
};
