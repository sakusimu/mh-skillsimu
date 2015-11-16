'use strict';
const assert = require('power-assert');
const data = require('../lib/data-loader.js');

describe('test/data-loader', () => {
    describe('export', () => {
        it('should contain mh4g', () => {
            assert(data.mh4g);
        });
        it('should contain mh4g.equips correctly', () => {
            let got = Object.keys(data.mh4g.equips).sort();
            let exp = [ 'head', 'body', 'arm', 'waist', 'leg' ].sort();
            assert.deepEqual(got, exp);

            assert(Array.isArray(data.mh4g.equips.head));
            assert(Array.isArray(data.mh4g.equips.body));
            assert(Array.isArray(data.mh4g.equips.arm));
            assert(Array.isArray(data.mh4g.equips.waist));
            assert(Array.isArray(data.mh4g.equips.leg));
        });
        it('should contain mh4g.decos as array', () => {
            assert(Array.isArray(data.mh4g.decos));
        });
        it('should contain mh4g.skills as array', () => {
            assert(Array.isArray(data.mh4g.skills));
        });
    });
});
