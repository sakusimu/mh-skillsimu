'use strict';
const assert = require('power-assert');
const Assembler = require('../../lib/equip/assembler');
const Normalizer = require('../../lib/equip/normalizer');
const Combinator = require('../../lib/equip/combinator');
const myapp = require('../support/lib/driver-myapp');

describe('mh4g/equip-assembler', () => {
    beforeEach(() => { myapp.initialize(); });

    describe('assemble: weapon slot', () => {
        let n = new Normalizer();
        let c = new Combinator();
        let a = new Assembler();

        it('should assemble if contain a slot2 weapon', () => {
            myapp.setup({
                context: { hr: 1, vs: 6 }, // 装備を村のみにしぼる
                weaponSlot: 2
            });
            n.initialize();

            let skills = [ '斬れ味レベル+1', '集中' ];
            let bulksSet = n.normalize(skills);
            let eqcombs = c.combine(skills, bulksSet);

            let assems = a.assemble(eqcombs);
            assert(assems.length === 36); // 頑シミュさんと同じ
        });
    });

    describe('assemble: oma', () => {
        let n = new Normalizer();
        let c = new Combinator();
        let a = new Assembler();

        it('should combine if contain omas', () => {
            myapp.setup({
                context: { hr: 1, vs: 6 }, // 装備を村のみにしぼる
                weaponSlot: 3,
                omas: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ]
            });
            n.initialize();

            let skills = [ '斬れ味レベル+1', '攻撃力UP【大】', '耳栓' ];
            let bulksSet = n.normalize(skills);
            let eqcombs = c.combine(skills, bulksSet);

            let assems = a.assemble(eqcombs);
            assert(assems.length === 3); // 頑シミュさんと同じ
        });

        it('should assemble if contain omas and slot0 weapon', () => {
            myapp.setup({
                context: { hr: 1, vs: 6 }, // 装備を村のみにしぼる
                weaponSlot: 0,
                omas: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ]
            });
            n.initialize();

            let skills = [ '斬れ味レベル+1', '攻撃力UP【大】', '耳栓' ];
            let bulksSet = n.normalize(skills);
            let eqcombs = c.combine(skills, bulksSet);

            let assems = a.assemble(eqcombs);
            assert(assems.length === 0);
        });
    });

    describe('assemble: dig', () => {
        let n = new Normalizer();
        let c = new Combinator();
        let a = new Assembler();

        it('should assemble if contain dig equips', () => {
            myapp.setup({
                omas: [
                    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
                    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
                    [ '龍の護石',3,'痛撃',4 ]
                ],
                dig: true
            });
            n.initialize();

            let skills = [ '真打', '集中', '弱点特効', '耳栓' ];
            let bulksSet = n.normalize(skills);
            let eqcombs = c.combine(skills, bulksSet);

            let assems = a.assemble(eqcombs);
            assert(assems.length === 157); // 頑シミュさんと同じ
        });
    });

    describe('assemble: summary', () => {
        let n = new Normalizer();
        let c = new Combinator();
        let a = new Assembler();

        it('[ "攻撃力UP【大】", "業物" ]', () => {
            let skills = [ '攻撃力UP【大】', '業物' ];
            let bulksSet = n.normalize(skills);
            let eqcombs = c.combine(skills, bulksSet);

            let assems = a.assemble(eqcombs);
            assert(assems.length === 280);
        });

        it('[ "斬れ味レベル+1", "高級耳栓" ]', () => {
            let skills = [ '斬れ味レベル+1', '高級耳栓' ];
            let bulksSet = n.normalize(skills);
            let eqcombs = c.combine(skills, bulksSet);

            let assems = a.assemble(eqcombs);
            assert(assems.length === 1737); // 頑シミュさんと同じ
        });

        it('[ "攻撃力UP【大】", "業物", "集中", "見切り+1", "弱点特効" ]', () => {
            let skills = [ '攻撃力UP【大】', '業物', '集中', '見切り+1', '弱点特効' ];
            let bulksSet = n.normalize(skills);
            let eqcombs = c.combine(skills, bulksSet);

            let assems = a.assemble(eqcombs);
            assert(assems.length === 0);
        });
    });
});
