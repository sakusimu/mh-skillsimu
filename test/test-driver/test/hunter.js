'use strict';
const assert = require('power-assert');
const Hunter = require('../hunter');

describe('test-driver/hunter', () => {
    describe('constructor()', () => {
        it('should create hunter', () => {
            let hunter = new Hunter();
            assert(hunter);

            assert(hunter.sex === 'm');
            assert(hunter.type === 'k');
            assert(hunter.hr === 8);
            assert(hunter.vs === 6);
        });
    });
});
