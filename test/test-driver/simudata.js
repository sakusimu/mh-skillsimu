'use strict';
const model = require('./model');

exports.equips = function equips(rawdataEquips, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let equips = (rawdataEquips || [])
            .map(cols => new model.Equip(cols))
            .filter(eq => eq.isEnabled(hunter))
            .map(eq => eq.simudata());
    return equips;
};

exports.decos = function decos(rawdataDecos, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let decos = (rawdataDecos || [])
            .map(cols => new model.Deco(cols))
            .filter(deco => deco.isEnabled(hunter))
            .map(deco => deco.simudata());
    return decos;
};

exports.skills = function skills(rawdataSkills) {
    let skills = {};
    (rawdataSkills || []).forEach(cols => {
        let skill = new model.Skill(cols);
        skills[skill.name] = skill.simudata();
    });
    return skills;
};

exports.charms = function charms(rawdataCharms) {
    let charms = (rawdataCharms || [])
            .map(cols => new model.Charm(cols))
            .map(charm => charm.simudata());
    return charms;
};

exports.digs = function digs(rawdataDigs, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let digs = (rawdataDigs || [])
            .map(cols => new model.Dig(cols))
            .filter(dig => dig.isEnabled(hunter))
            .map(dig => dig.simudata());
    return digs;
};
