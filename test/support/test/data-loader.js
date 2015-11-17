'use strict';
const assert = require('power-assert');
const load = require('../lib/data-loader.js');

describe('test/data-loader', () => {
    describe('export', () => {
        it('should export load', () => {
            assert(typeof load === 'function');
        });
    });

    describe('load()', () => {
        it('should load if specify mh4g', () => {
            let data = load('mh4g');

            let got = Object.keys(data.equips).sort();
            let exp = [ 'head', 'body', 'arm', 'waist', 'leg' ].sort();
            assert.deepEqual(got, exp);

            assert(Array.isArray(data.equips.head));
            assert(Array.isArray(data.equips.body));
            assert(Array.isArray(data.equips.arm));
            assert(Array.isArray(data.equips.waist));
            assert(Array.isArray(data.equips.leg));

            assert(Array.isArray(data.decos));
            assert(Array.isArray(data.skills));
        });

        it('should throw exception in some case', () => {
            let got;
            try { load(); } catch (e) { got = e.message; }
            assert(got === 'series is required');
            try { load('hoge'); } catch (e) { got = e.message; }
            assert(got === 'unknown series: hoge');
        });
    });
});
