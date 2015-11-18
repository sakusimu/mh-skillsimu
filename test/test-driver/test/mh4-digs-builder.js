'use strict';
const assert = require('power-assert');
const digs = require('../mh4-digs-builder');

describe('test/mh4-digs-builder', () => {
    describe('export', () => {
        it('should export digs', () => {
            let got = Object.keys(digs.weapon).length;
            assert(got === 24);
            got = Object.keys(digs.head).length;
            assert(got === 36);
        });
    });
});
