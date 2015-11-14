'use strict';
const assert = require('power-assert');
const simu = require('../../index');

describe('index', () => {
    describe('export', () => {
        it('should some properties', () => {
            assert(/\d+\.\d+\.\d+/.test(simu.VERSION));
            assert(typeof simu.Simulator === 'function');
            assert(simu.data);
            assert(simu.util);
        });
    });

    (global.document ? describe : describe.skip)('Browser', () => {
        /* global window:false */
        it('should have window.simu', () => {
            assert(window.simu === simu);
        });
    });
});
