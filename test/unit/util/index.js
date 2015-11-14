'use strict';
const assert = require('power-assert');
const util = require('../../../lib/util');

describe('util/index', () => {
    describe('export', () => {
        it('should have some properties', () => {
            assert(util.parts);
            assert(util.skill);
            assert(util.deco);
            assert(util.comb);
            assert(typeof util.BorderLine === 'function');
        });
    });
});
