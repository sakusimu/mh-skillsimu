'use strict';
const pkg = require('./package.json');

exports.VERSION = pkg.version;
exports.Simulator = require('./lib/simulator');
exports.util = require('./lib/util');
