'use strict';
const assert = require('power-assert');
const Assembler = require('../../../lib/deco/assembler');

describe('deco/assembler', () => {
    describe('constructor()', () => {
        it('should create assembler', () => {
            let a = new Assembler();
            assert(a);
        });
    });

    describe('assemble()', () => {
        let a = new Assembler();

        it('should return [] if null or etc', () => {
            assert.deepEqual(a.assemble(), []);
            assert.deepEqual(a.assemble(null), []);
            assert.deepEqual(a.assemble([]), []);
        });
    });
});
