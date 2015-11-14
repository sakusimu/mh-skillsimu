'use strict';
const assert = require('power-assert');
const Simulator = require('../../../lib/deco/simulator');
const myapp = require('../../support/lib/driver-myapp');

describe('deco/simulator', () => {
    beforeEach(() => { myapp.initialize(); });

    describe('constructor()', () => {
        it('should create simulator', () => {
            let simu = new Simulator();
            assert(simu);
        });
    });
});
