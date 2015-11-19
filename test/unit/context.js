'use strict';
const assert = require('power-assert');
const Context = require('../../lib/context');

describe('context', () => {
    const EQUIPS = {
        head  : [ 'head01', 'head02' ],
        body  : [ 'body01', 'body02' ],
        arm   : [ 'arm01', 'arm02' ],
        waist : [ 'waist01', 'waist02' ],
        leg   : [ 'leg01', 'leg02' ],
        weapon: [ 'wpn01', 'wpn02' ],
        charm : [ 'charm01', 'charm02' ]
    };
    const DECOS = [ 'deco01', 'deco02' ];
    const SKILLS = { 'skill01': 'skill01', 'skill02': 'skill02' };

    describe('constructor()', () => {
        it('should create context', () => {
            let ctx = new Context({ equips: EQUIPS, decos: DECOS, skills: SKILLS });
            assert(ctx);

            assert.deepEqual(ctx.equips, EQUIPS);
            assert.deepEqual(ctx.decos, DECOS);
            assert.deepEqual(ctx.skills, SKILLS);
        });

        it('should create context if no arguments', () => {
            let ctx = new Context();
            assert(ctx);

            let got = ctx.equips;
            let exp = { head: [], body: [], arm: [], waist:[], leg:[], weapon: [], charm: [] };
            assert.deepEqual(got, exp);
            assert.deepEqual(ctx.decos, []);
            assert.deepEqual(ctx.skills, {});
        });
    });

    describe('init()', () => {
        it('should init', () => {
            let ctx = new Context();

            let equips = Object.assign({}, EQUIPS);
            equips.weapon = null;
            ctx.init({ equips: equips, decos: DECOS, skills: SKILLS });
            let got = ctx.equips;
            let exp = {
                head  : [ 'head01', 'head02' ],
                body  : [ 'body01', 'body02' ],
                arm   : [ 'arm01', 'arm02' ],
                waist : [ 'waist01', 'waist02' ],
                leg   : [ 'leg01', 'leg02' ],
                weapon: [],
                charm : [ 'charm01', 'charm02' ]
            };
            assert.deepEqual(got, exp);
            assert.deepEqual(ctx.decos, DECOS);
            assert.deepEqual(ctx.skills, SKILLS);
        });
    });
});
