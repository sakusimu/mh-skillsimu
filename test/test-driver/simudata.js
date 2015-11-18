'use strict';
const model = require('./model');

exports.equips = function equips(rawdataEquips, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let equips = (rawdataEquips || [])
            .map(cols => new model.Equip(cols))
            .filter(eq => eq.isEnabled(hunter))
            .map(eq => eq.simuData());
    return equips;
};

exports.decos = function decos(rawdataDecos, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let decos = (rawdataDecos || [])
            .map(cols => new model.Deco(cols))
            .filter(deco => deco.isEnabled(hunter))
            .map(deco => deco.simuData());
    return decos;
};

exports.skills = function skills(rawdataSkills) {
    let skills = {};
    (rawdataSkills || []).forEach(cols => {
        let skill = new model.Skill(cols);
        skills[skill.name] = skill.simuData();
    });
    return skills;
};

exports.omas = function omas(rawdataOmas) {
    let omas = (rawdataOmas || [])
            .map(cols => new model.Oma(cols))
            .map(oma => oma.simuData());
    return omas;
};

exports.digs = function digs(rawdataDigs, hunter) {
    if (hunter == null) throw new Error('hunter is required');
    let digs = (rawdataDigs || [])
            .map(cols => new model.Dig(cols))
            .filter(dig => dig.isEnabled(hunter))
            .map(dig => dig.simuData());
    return digs;
};
