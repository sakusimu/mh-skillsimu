'use strict';
const assert = require('power-assert');
const load = require('../data-loader.js');
const Module = require('module');

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


    describe('_load()', () => {
        const isNode = typeof window === 'undefined';
        let backup;

        (isNode ? describe : describe.skip)('on Node.js', () => {
            before(() => { backup = Module.prototype.require; });
            after(() => { Module.prototype.require = backup; });

            it('should load', () => {
                Module.prototype.require = path => `require: ${path}`;

                let got = load._load('/path/to/mh4g/equip_head.json');
                assert(got === 'require: /path/to/mh4g/equip_head.json');
            });
        });

        (!isNode ? describe : describe.skip)('on Browser', () => {
            /* global window */
            before(() => { backup = window.testdata.mh4g.equip_head; });
            after(() => { window.testdata.mh4g.equip_head = backup; });

            it('should load', () => {
                window.testdata.mh4g.equip_head = 'use testdata';
                let got = load._load('/path/to/mh4g/equip_head.json');
                assert(got === 'use testdata');
            });
        });

        it('should throw exception if not json', () => {
            let got;
            try { load._load('/path/to/mh4g/version.txt'); } catch (e) { got = e.message; }
            assert(got === 'unmatch path: /path/to/mh4g/version.txt');
        });
        it('should throw exception if unmatch path', () => {
            let got;
            try { load._load('/path/to/hoge/equip_head.json'); } catch (e) { got = e.message; }
            assert(got === 'unmatch path: /path/to/hoge/equip_head.json');
        });
    });
});
