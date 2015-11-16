'use strict';
const path = require('path');

let rootDir = path.resolve(__dirname, '..', '..', '..');
let dataDir = path.resolve(rootDir, 'tmp', 'testdata');

let testdata = {
    mh4g: {
        equips: {
            head : require(`${dataDir}/mh4g/equip_head.json`),
            body : require(`${dataDir}/mh4g/equip_body.json`),
            arm  : require(`${dataDir}/mh4g/equip_arm.json`),
            waist: require(`${dataDir}/mh4g/equip_waist.json`),
            leg  : require(`${dataDir}/mh4g/equip_leg.json`)
        },
        decos: require(`${dataDir}/mh4g/deco.json`),
        skills: require(`${dataDir}/mh4g/skill.json`)
    }
};

module.exports = testdata;
