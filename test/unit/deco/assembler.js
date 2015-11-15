'use strict';
const assert = require('power-assert');
const Assembler = require('../../../lib/deco/assembler');
const Context = require('../../../lib/context');

describe('deco/assembler', () => {
    let context = new Context();

    describe('constructor()', () => {
        it('should create assembler', () => {
            let a = new Assembler(context);
            assert(a);
            assert(a.context === context);
        });

        it('should throw exception if no arguments', () => {
            let got;
            try { new Assembler(); } catch (e) { got = e.message; }
            assert(got === 'context is required');
        });
    });

    describe('assemble()', () => {
        let a = new Assembler(context);

        it('should return [] if null or etc', () => {
            assert.deepEqual(a.assemble(), []);
            assert.deepEqual(a.assemble(null), []);
            assert.deepEqual(a.assemble([]), []);
        });
    });
});
