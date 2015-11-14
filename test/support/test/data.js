'use strict';
const assert = require('power-assert');
const data = require('../lib/driver-data');

describe('test-driver/data', () => {
    describe('export', () => {
        it('should export data', () => {
            assert(data);
        });

        it('should export equips', () => {
            let equips = data.equips;

            assert(equips.head.length > 0);
            assert(equips.body.length > 0);
            assert(equips.arm.length > 0);
            assert(equips.waist.length > 0);
            assert(equips.leg.length > 0);
        });

        it('should export decos', () => {
            assert(data.decos.length > 0);
        });

        it('should export skills', () => {
            assert(data.skills.length > 0);
        });
    });
});
