'use strict';
const assert = require('power-assert');
const Combinator = require('../../lib/equip/combinator');
const Context = require('../../lib/context');
const Normalizer = require('../../lib/equip/normalizer');
const myapp = require('../test-driver/myapp')('mh4g');

describe('mh4g/equip-combinator', () => {
    let context = new Context();
    let n = new Normalizer(context);
    let c = new Combinator(context);

    beforeEach(() => {
        myapp.init();
        context.init(myapp.data);
    });

    describe('combine: weapon slot', () => {
        it('should combine if contain a slot2 weapon', () => {
            myapp.setup({
                hunter: { hr: 1, vs: 6 }, // 装備を村のみにしぼる
                weaponSlot: 2
            });
            context.init(myapp.data);

            let skillnames = [ '斬れ味レベル+1', '集中' ];
            let bulksSet = n.normalize(skillnames);

            let eqcombs = c.combine(skillnames, bulksSet);
            assert(eqcombs.length === 6);
        });
    });

    describe('combine: charm', () => {
        it('should combine if contain charms', () => {
            myapp.setup({
                hunter: { hr: 1, vs: 6 }, // 装備を村のみにしぼる
                weaponSlot: 3,
                charms: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ]
            });
            context.init(myapp.data);

            let skillnames = [ '斬れ味レベル+1', '攻撃力UP【大】', '耳栓' ];
            let bulksSet = n.normalize(skillnames);

            let eqcombs = c.combine(skillnames, bulksSet);
            assert(eqcombs.length === 12);
        });

        it('should combine if contain charms and slot0 weapon', () => {
            myapp.setup({
                hunter: { hr: 1, vs: 6 }, // 装備を村のみにしぼる
                weaponSlot: 0,
                charms: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ]
            });
            context.init(myapp.data);

            let skillnames = [ '斬れ味レベル+1', '攻撃力UP【大】', '耳栓' ];
            let bulksSet = n.normalize(skillnames);

            let eqcombs = c.combine(skillnames, bulksSet);
            assert(eqcombs.length === 0);
        });
    });

    describe('combine: dig', () => {
        it('should combine if contain dig equips', () => {
            myapp.setup({
                charms: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ],
                dig: true
            });
            context.init(myapp.data);

            let skillnames = [ '真打', '集中', '弱点特効', '耳栓' ];
            let bulksSet = n.normalize(skillnames);

            let eqcombs = c.combine(skillnames, bulksSet);
            assert(eqcombs.length === 141);
        });
    });

    describe('combine: summary', () => {
        beforeEach(() => { context.init(myapp.data); });

        it('[ "攻撃力UP【大】", "業物" ]', () => {
            let skillnames = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = n.normalize(skillnames);
            let eqcombs = c.combine(skillnames, bulksSet);
            assert(eqcombs.length === 18);
        });

        it('[ "斬れ味レベル+1", "高級耳栓" ]', () => {
            let skillnames = [ '斬れ味レベル+1', '高級耳栓' ];
            let bulksSet = n.normalize(skillnames);
            let eqcombs = c.combine(skillnames, bulksSet);
            assert(eqcombs.length === 418);
        });

        it('[ "攻撃力UP【大】", "業物", "集中", "見切り+1", "弱点特効" ]', () => {
            let skillnames = [ '攻撃力UP【大】', '業物', '集中', '見切り+1', '弱点特効' ];
            let bulksSet = n.normalize(skillnames);
            let eqcombs = c.combine(skillnames, bulksSet);
            assert(eqcombs.length === 0);
        });
    });
});
