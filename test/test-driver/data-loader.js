'use strict';
const path = require('path');

let rootDir = path.resolve(__dirname, '..', '..');
let dataDir = path.resolve(rootDir, 'tmp', 'testdata');

let loader = {
    mh4g: mh4g
};

function load(series) {
    if (series == null) throw new Error('series is required');

    let fn = loader[series];
    if (fn == null) throw new Error(`unknown series: ${series}`);

    return fn();
}
module.exports = load;

function mh4g() {
    return {
        equips: {
            head : require(`${dataDir}/mh4g/equip_head.json`),
            body : require(`${dataDir}/mh4g/equip_body.json`),
            arm  : require(`${dataDir}/mh4g/equip_arm.json`),
            waist: require(`${dataDir}/mh4g/equip_waist.json`),
            leg  : require(`${dataDir}/mh4g/equip_leg.json`)
        },
        decos: require(`${dataDir}/mh4g/deco.json`),
        skills: require(`${dataDir}/mh4g/skill.json`),
        digs: require('./mh4-digs-builder')
    };
}
