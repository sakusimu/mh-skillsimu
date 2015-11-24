'use strict';
const assert = require('power-assert');
const Combinator = require('../../lib/deco/combinator');
const Context = require('../../lib/context');
const Normalizer = require('../../lib/deco/normalizer');
const myapp = require('../test-driver/myapp')('mh4g');
const simplify = require('../support/util').simplifyDecombs;

describe('mh4g/deco-combinator', () => {
    let context = new Context();
    let n = new Normalizer(context);
    let c = new Combinator(context);

    beforeEach(() => {
        myapp.init();
        context.init(myapp.data);
    });

    describe('combine', () => {
        it('should combine if equips contain torsoUp, weaponSlot, charm', () => {
            let skillnames = [ '斬れ味レベル+1', '高級耳栓' ];
            let equips = {
                head  : myapp.equip('head', 'ユクモノカサ・天'),
                body  : myapp.equip('body', '三眼の首飾り'),
                arm   : myapp.equip('arm', 'ユクモノコテ・天'),
                waist : myapp.equip('waist', 'バンギスコイル'),
                leg   : myapp.equip('leg', 'ユクモノハカマ・天'),
                weapon: { name: 'slot2', slot: 2, skills: {} },
                charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };
            let bulksSet = n.normalize(skillnames, equips);

            let decombs = c.combine(skillnames, bulksSet, equips);
            let got = simplify(decombs);
            let exp = [
                '匠珠【３】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【３】(胴)',
                '匠珠【２】,匠珠【２】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【３】,防音珠【３】(胴)',
                '匠珠【２】,匠珠【２】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【３】(胴)'
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if all equips are slot3', () => {
            // ALL三眼, 武器スロ3, お守り(匠4,スロ3)
            let skillnames = [ '斬れ味レベル+1', '砥石使用高速化' ];
            let equips = {
                head  : myapp.equip('head', '三眼のピアス'),
                body  : myapp.equip('body', '三眼の首飾り'),
                arm   : myapp.equip('arm', '三眼の腕輪'),
                waist : myapp.equip('waist', '三眼の腰飾り'),
                leg   : myapp.equip('leg', '三眼の足輪'),
                weapon: { name: 'slot3', slot: 3, skills: {} },
                charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };
            let bulksSet = n.normalize(skillnames, equips);

            let decombs = c.combine(skillnames, bulksSet, equips);
            let got = simplify(decombs);
            let exp = [
                '匠珠【３】,匠珠【３】,匠珠【３】,研磨珠【１】,研磨珠【１】,研磨珠【１】,研磨珠【１】,研磨珠【１】',
                '匠珠【２】,匠珠【２】,匠珠【３】,匠珠【３】,研磨珠【１】,研磨珠【１】,研磨珠【１】,研磨珠【１】,研磨珠【１】'
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if slot3 appear later', () => {
            // 後半にスロ3が出てくるパターン(前半のスロ1は使わないスロとして処理できるか)
            let skillnames = [ '斬れ味レベル+1', '高級耳栓' ];
            let equips = {
                head : myapp.equip('head', 'ミヅハ【烏帽子】'),
                body : myapp.equip('body', 'エクスゼロメイル'),
                arm  : myapp.equip('arm', 'EXレックスアーム'),
                waist: myapp.equip('waist', 'クシャナアンダ'),   // slot3
                leg  : myapp.equip('leg', 'ゾディアスグリーヴ'), // slot3
                weapon: null,
                charm: null
            };
            let bulksSet = n.normalize(skillnames, equips);

            let decombs = c.combine(skillnames, bulksSet, equips);
            let got = simplify(decombs);
            let exp = [
                '匠珠【２】,匠珠【３】,防音珠【１】,防音珠【３】',
                '匠珠【２】,匠珠【３】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】'
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if skill already activates', () => {
            // 既にスキルが発動
            let skillnames = [ '斬れ味レベル+1' ];
            let equips = {
                head  : myapp.equip('head', 'ユクモノカサ・天'),
                body  : myapp.equip('body', 'ユクモノドウギ・天'),
                arm   : myapp.equip('arm', 'ユクモノコテ・天'),
                waist : myapp.equip('waist', 'ユクモノオビ・天'),
                leg   : myapp.equip('leg', 'ユクモノハカマ・天'),
                weapon: null,
                charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
            };
            let bulksSet = n.normalize(skillnames, equips);

            let decombs = c.combine(skillnames, bulksSet, equips);
            let got = simplify(decombs);
            assert.deepEqual(got, []);
        });
    });
});
