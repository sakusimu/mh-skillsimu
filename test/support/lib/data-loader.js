'use strict';
const fs   = require('fs');
const path = require('path');

let testdata = global.testdata;

if (!testdata) {
    let root = path.resolve(__dirname, '..', '..', '..');
    let filepath = path.join(root, 'tmp/testdata.js');

    let jscode = fs.readFileSync(filepath, 'utf-8');

    testdata = eval(jscode);
}

module.exports = testdata;
