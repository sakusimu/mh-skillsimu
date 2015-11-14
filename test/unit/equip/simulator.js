'use strict';
const assert = require('power-assert');
const Simulator = require('../../../lib/equip/simulator');

describe('equip/simulator', () => {
    describe('constructor()', () => {
        it('should create simulator', () => {
            let simu = new Simulator();
            assert(simu);
        });
    });
});
