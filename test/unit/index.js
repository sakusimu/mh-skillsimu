'use strict';
const assert = require('power-assert');
const mhsimu = require('../../index');
const Simulator = require('../../lib/simulator');
const util = require('../../lib/util');

describe('index', () => {
    describe('export', () => {
        it('should export function', () => {
            assert(typeof mhsimu === 'function');
        });

        it('should have some properties', () => {
            assert(/\d+\.\d+\.\d+/.test(mhsimu.VERSION));
            assert(mhsimu.util === util);
        });

        it('should return instance of Simulator', () => {
            let got = mhsimu();
            assert(got instanceof Simulator);
        });
    });
});
