'use strict';
const assert = require('power-assert');
const Combinator = require('../../lib/deco/combinator');
const Context = require('../../lib/context');
const Normalizer = require('../../lib/deco/normalizer');
const myapp = require('../support/lib/driver-myapp');

describe('mh4g/deco-combinator', () => {
    let context = new Context();
    let n = new Normalizer(context);
    let c = new Combinator(context);

    beforeEach(() => {
        myapp.initialize();
        context.init(myapp.data);
    });

    // 頑シミュさんの装飾品検索の結果と比較しやすくする
    function simplify(decombs) {
        return decombs.map(decomb => {
            let torsoUp = Object.keys(decomb).map(part => decomb[part]).some(comb => {
                if (comb == null) return false;
                return comb.skillComb['胴系統倍加'] ? true : false;
            });
            let names = [];
            Object.keys(decomb).forEach(part => {
                let comb = decomb[part];
                let decos = comb ? comb.decos : [];
                if (torsoUp && part === 'body') decos = decos.map(deco => deco += '(胴)');
                names = names.concat(decos);
            });
            return names.sort().join(',');
        });
    }

    describe('combine', () => {
        it('should combine if equips contain torsoUp, weaponSlot, oma', () => {
            let skills = [ '斬れ味レベル+1', '高級耳栓' ];
            let equip = {
                head  : { name: 'ユクモノカサ・天', slot: 2,
                          skillComb: { '匠': 2, '研ぎ師': 3, '回復量': 1, '加護': 1 } },
                body  : { name: '三眼の首飾り', slot: 3, skillComb: {} },
                arm   : { name: 'ユクモノコテ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 3, '回復量': 2, '加護': 3 } },
                waist : { name: 'バンギスコイル', slot: 0, skillComb: { '胴系統倍加': 1 } },
                leg   : { name: 'ユクモノハカマ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } },
                weapon: { name: 'slot2', slot: 2, skillComb: {} },
                oma   : { name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                          skillComb: { '匠': 4, '氷耐性': -5 } }
            };
            let bulksSet = n.normalize(skills, equip);

            let decombs = c.combine(skills, bulksSet, equip);
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
            let skills = [ '斬れ味レベル+1', '砥石使用高速化' ];
            let equip = {
                head  : { name: '三眼のピアス', slot: 3, skillComb: {} },
                body  : { name: '三眼の首飾り', slot: 3, skillComb: {} },
                arm   : { name: '三眼の腕輪', slot: 3, skillComb: {} },
                waist : { name: '三眼の腰飾り', slot: 3, skillComb: {} },
                leg   : { name: '三眼の足輪', slot: 3, skillComb: {} },
                weapon: { name: 'slot3', slot: 3, skillComb: {} },
                oma   : { name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                          skillComb: { '匠': 4, '氷耐性': -5 } }
            };
            let bulksSet = n.normalize(skills, equip);

            let decombs = c.combine(skills, bulksSet, equip);
            let got = simplify(decombs);
            let exp = [
                '匠珠【３】,匠珠【３】,匠珠【３】,研磨珠【１】,研磨珠【１】,研磨珠【１】,研磨珠【１】,研磨珠【１】',
                '匠珠【２】,匠珠【２】,匠珠【３】,匠珠【３】,研磨珠【１】,研磨珠【１】,研磨珠【１】,研磨珠【１】,研磨珠【１】'
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if slot3 appear later', () => {
            // 後半にスロ3が出てくるパターン(前半のスロ1は使わないスロとして処理できるか)
            let skills = [ '斬れ味レベル+1', '高級耳栓' ];
            let equip = {
                head : { name: 'ミヅハ【烏帽子】', slot: 1,
                         skillComb: { '匠': 1, '聴覚保護': 5, '風圧': 4, '耐暑': -2 } },
                body : { name: 'エクスゼロメイル', slot: 1,
                         skillComb: { '聴覚保護': 3, '研ぎ師': -2, '食事': 3 } },
                arm  : { name: 'EXレックスアーム', slot: 2,
                         skillComb: { '匠': 2, '聴覚保護': 2, '研ぎ師': -2, '食いしん坊': 2 } },
                waist: { name: 'クシャナアンダ', slot: 3,
                         skillComb: { '匠': 2, '溜め短縮': 2, '毒': -2 } },
                leg  : { name: 'ゾディアスグリーヴ', slot: 3,
                         skillComb: { '剣術': 1, '匠': 2, '乗り': -3 } },
                weapon: null,
                oma: null
            };
            let bulksSet = n.normalize(skills, equip);

            let decombs = c.combine(skills, bulksSet, equip);
            let got = simplify(decombs);
            let exp = [
                '匠珠【２】,匠珠【３】,防音珠【１】,防音珠【３】',
                '匠珠【２】,匠珠【３】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】,防音珠【１】'
            ];
            assert.deepEqual(got, exp);
        });

        it('should combine if skill already activates', () => {
            // 既にスキルが発動
            let skills = [ '斬れ味レベル+1' ];
            let equip = {
                head  : { name: 'ユクモノカサ・天', slot: 2,
                          skillComb: { '匠': 2, '研ぎ師': 3, '回復量': 1, '加護': 1 } },
                body  : { name: 'ユクモノドウギ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } },
                arm   : { name: 'ユクモノコテ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 3, '回復量': 2, '加護': 3 } },
                waist : { name: 'ユクモノオビ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 2, '回復量': 3, '加護': 2 } },
                leg   : { name: 'ユクモノハカマ・天', slot: 2,
                          skillComb: { '匠': 1, '研ぎ師': 1, '回復量': 2, '加護': 2 } },
                weapon: null,
                oma   : { name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                          skillComb: { '匠': 4, '氷耐性': -5 } }
            };
            let bulksSet = n.normalize(skills, equip);

            let decombs = c.combine(skills, bulksSet, equip);
            let got = simplify(decombs);
            assert.deepEqual(got, []);
        });
    });
});
