'use strict';
const assert = require('power-assert');
const Simulator = require('../../../lib/deco/simulator');
const Context = require('../../../lib/context');

describe('deco/simulator', () => {
    let context = new Context();

    describe('constructor()', () => {
        it('should create simulator', () => {
            let simu = new Simulator(context);
            assert(simu);
        });
    });
});
