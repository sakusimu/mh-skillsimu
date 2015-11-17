'use strict';
const assert = require('power-assert');
const Simulator = require('../../lib/simulator');

describe('simulator', () => {
    describe('constructor()', () => {
        it('should create simulator', () => {
            let simu = new Simulator();
            assert(simu);

            assert(simu._context);
            assert(simu._equip);
            assert(simu._deco);
        });
    });
});
