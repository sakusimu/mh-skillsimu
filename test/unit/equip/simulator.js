'use strict';
const assert = require('power-assert');
const Simulator = require('../../../lib/equip/simulator');
const Context = require('../../../lib/context');

describe('equip/simulator', () => {
    let context = new Context();

    describe('constructor()', () => {
        it('should create simulator', () => {
            let simu = new Simulator(context);
            assert(simu);
        });
    });
});
