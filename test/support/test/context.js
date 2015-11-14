'use strict';
const assert = require('power-assert');
const Context = require('../lib/driver-context');

describe('test-driver/context', () => {
    describe('constructor()', () => {
        it('should create context', () => {
            let ctx = new Context();
            assert(ctx);

            assert(ctx.sex === 'm');
            assert(ctx.type === 'k');
            assert(ctx.hr === 8);
            assert(ctx.vs === 6);
        });
    });
});
