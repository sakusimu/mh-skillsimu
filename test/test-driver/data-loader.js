'use strict';
const path = require('path');

let rootDir = path.resolve(__dirname, '..', '..');
let dataDir = path.resolve(rootDir, 'tmp', 'testdata');

let loader = {
    mh4g: mh4g
};

exports = module.exports = load;

function load(series) {
    if (series == null) throw new Error('series is required');

    let fn = loader[series];
    if (fn == null) throw new Error(`unknown series: ${series}`);

    return fn();
}

function mh4g() {
    return {
        equips: {
            head : _load(`${dataDir}/mh4g/equip_head.json`),
            body : _load(`${dataDir}/mh4g/equip_body.json`),
            arm  : _load(`${dataDir}/mh4g/equip_arm.json`),
            waist: _load(`${dataDir}/mh4g/equip_waist.json`),
            leg  : _load(`${dataDir}/mh4g/equip_leg.json`)
        },
        decos: _load(`${dataDir}/mh4g/deco.json`),
        skills: _load(`${dataDir}/mh4g/skill.json`),
        digs: require('./mh4-digs-builder')
    };
}

let isNode = typeof window === 'undefined';

function _load(path) {
    let matches = /.+\/(mh.+)\/(.+)\.json$/.exec(path);
    if (matches == null) throw new Error(`unmatch path: ${path}`);
    let series = matches[1];
    let prop = matches[2];

    /* global window */
    return isNode ? require(path) : window.testdata[series][prop];
}
exports._load = _load; // export for test
