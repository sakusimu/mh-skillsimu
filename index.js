'use strict';
const VERSION = require('./package.json').version;
const Simulator = require('./lib/simulator');
const util = require('./lib/util');

exports = module.exports = createSimulator;

function createSimulator() {
    let simu = new Simulator();
    simu.init.apply(simu, arguments);
    return simu;
}

exports.VERSION = VERSION;
exports.util = util;
