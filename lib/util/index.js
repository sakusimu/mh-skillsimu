'use strict';

exports.parts = [ 'head', 'body', 'arm', 'waist', 'leg', 'weapon', 'charm' ];
exports.skill = require('./skill');
exports.deco  = require('./deco');
exports.comb  = require('./comb');
exports.BorderLine = require('./border-line');

// 単純な Object (というかハッシュ)をシャローコピーするだけを想定
function clone(obj) {
    if (obj == null) return null;
    let ret = {};
    for (let prop in obj) ret[prop] = obj[prop];
    return ret;
}
exports.clone = clone;
