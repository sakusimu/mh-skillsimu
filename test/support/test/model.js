'use strict';
const assert = require('power-assert');
const model = require('../lib/driver-model');
const data = require('../lib/driver-data');
const Hunter = require('../lib/driver-hunter');

describe('test-driver/model', () => {
    describe('model.make()', () => {
        it('should make', () => {
            let props = [ 'id', 'name', 'num' ];
            let numProps = { num: true };
            let list = [ 'ID', '名前', '0' ];
            let m = model.make(list, props, numProps);
            assert(m.id === 'ID');
            assert(m.name === '名前');
            assert(m.num === 0);
        });

        it('should throw exception if num prop is not number', () => {
            let props = [ 'num' ];
            let numProps = { num: true };
            let list = [ 'not a number' ];
            let got;
            try { model.make(list, props, numProps); } catch (e) { got = e.message; }
            assert(got === 'num is NaN');
        });
    });

    describe('Equip#constructor()', () => {
        it('should create equip', () => {
            let list = [
                '名前',0,1,'レア度',2,5,6,
                '初期防御力','最終防御力','火耐性','水耐性','氷耐性','雷耐性','龍耐性',
                'スキル系統1',21,'スキル系統2',22,'スキル系統3',23,
                'スキル系統4',24,'スキル系統5',25,
                '生産素材1','個数','生産素材2','個数','生産素材3','個数','生産素材4','個数'
            ];

            let eq = new model.Equip(list);
            assert(eq);

            assert(eq.id === '名前,0,1');
            assert(eq.name === '名前');
            assert(eq.sex === 0);
            assert(eq.type === 1);
            assert(eq.rarity === 'レア度');
            assert(eq.slot === 2);
            assert(eq.availableHR === 5);
            assert(eq.availableVS === 6);
            // '初期防御力'
            // '最終防御力'
            // '火耐性'
            // '水耐性'
            // '氷耐性'
            // '雷耐性'
            // '龍耐性'
            assert(eq.skillTree1 === 'スキル系統1');
            assert(eq.skillPt1 === 21);
            assert(eq.skillTree2 === 'スキル系統2');
            assert(eq.skillPt2 === 22);
            assert(eq.skillTree3 === 'スキル系統3');
            assert(eq.skillPt3 === 23);
            assert(eq.skillTree4 === 'スキル系統4');
            assert(eq.skillPt4 === 24);
            assert(eq.skillTree5 === 'スキル系統5');
            assert(eq.skillPt5 === 25);
            //QUnit.strictEqual('生産素材1');
            //QUnit.strictEqual('個数');
            //QUnit.strictEqual('生産素材2');
            //QUnit.strictEqual('個数');
            //QUnit.strictEqual('生産素材3');
            //QUnit.strictEqual('個数');
            //QUnit.strictEqual('生産素材4');
            //QUnit.strictEqual('個数');
        });

        it('should create equip if null or etc', () => {
            let eq = new model.Equip();
            assert(eq.name === null);

            eq = new model.Equip(null);
            assert(eq.name === null);

            eq = new model.Equip([]);
            assert(eq.name === null);
        });
    });

    describe('Equip#toString()', () => {
        it('shoule return string', () => {
            let list = ['ブレイブヘッド',0,0,1,1,1,1,1,55,2,0,0,0,1,'体力',-1,'回復速度',3,'乗り',2,null,null,null,null,'竜骨【小】',1,null,null,null,null,null,null];

            let eq = new model.Equip(list);
            assert(eq.toString() === 'ブレイブヘッド');
        });
    });

    describe('Equip#isEnabled()', () => {
        it('should return true if equip is enabled', () => {
            let hunter = new Hunter();

            // ID,名前,"性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",レア度,スロット数,入手時期／HR（99=集会場入手不可）,入手時期／村★（99=村入手不可）
            let equips = [
                [ '両/両/r/s/HR3/★6','0','0','4','0','3','6' ],
                [ '両/剣/r/s/HR3/★6','0','1','4','0','3','6' ],
                [ '両/ガ/r/s/HR3/★6','0','2','4','0','3','6' ],

                [ '男/両/r/s/HR3/★6','1','0','4','0','3','6' ],
                [ '男/剣/r/s/HR3/★6','1','1','4','0','3','6' ],
                [ '男/ガ/r/s/HR3/★6','1','2','4','0','3','6' ],

                [ '女/両/r/s/HR3/★6','2','0','4','0','3','6' ],
                [ '女/剣/r/s/HR3/★6','2','1','4','0','3','6' ],
                [ '女/ガ/r/s/HR3/★6','2','2','4','0','3','6' ]
            ].map(list => new model.Equip(list));

            hunter.init({ sex: 'm', type: 'k' });
            let got = equips.map(e => e.isEnabled(hunter));
            let exp = [ true,true,false, true,true,false, false,false,false ];
            assert.deepEqual(got, exp, 'm k');
            hunter.init({ sex: 'm', type: 'g' });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,false,true, true,false,true, false,false,false ];
            assert.deepEqual(got, exp, 'm g');
            hunter.init({ sex: 'w', type: 'k' });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,false, false,false,false, true,true,false ];
            assert.deepEqual(got, exp, 'w k');
            hunter.init({ sex: 'w', type: 'g' });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,false,true, false,false,false, true,false,true ];
            assert.deepEqual(got, exp, 'w g');

            equips = [
                [ '両/両/r/s/HR1/★1','0','0','4','0','1','1' ],
                [ '両/両/r/s/HR1/★6','0','0','4','0','1','6' ],
                [ '両/両/r/s/HR1/★99','0','0','4','0','1','99' ],

                [ '両/両/r/s/HR6/★1','0','0','4','0','6','1' ],
                [ '両/両/r/s/HR6/★6','0','0','4','0','6','6' ],
                [ '両/両/r/s/HR6/★99','0','0','4','0','6','99' ],

                [ '両/両/r/s/HR99/★1','0','0','4','0','99','1' ],
                [ '両/両/r/s/HR99/★6','0','0','4','0','99','6' ],
                [ '両/両/r/s/HR99/★99','0','0','4','0','99','99' ]
            ].map(list => new model.Equip(list));

            hunter.init({ hr: 1, vs: 1 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,false,false, true,false,false ];
            assert.deepEqual(got, exp, 'hr=1, vs=1');
            hunter.init({ hr: 1, vs: 5 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,false,false, true,false,false ];
            assert.deepEqual(got, exp, 'hr=1, vs=5');
            hunter.init({ hr: 1, vs: 6 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,false, true,true,false ];
            assert.deepEqual(got, exp, 'hr=1, vs=6');
            hunter.init({ hr: 1, vs: 7 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,false, true,true,false ];
            assert.deepEqual(got, exp, 'hr=1, vs=7');
            hunter.init({ hr: 5, vs: 1 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,false,false, true,false,false ];
            assert.deepEqual(got, exp, 'hr=5, vs=1');
            hunter.init({ hr: 5, vs: 5 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,false,false, true,false,false ];
            assert.deepEqual(got, exp, 'hr=5, vs=5');
            hunter.init({ hr: 5, vs: 6 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,false, true,true,false ];
            assert.deepEqual(got, exp, 'hr=5, vs=6');
            hunter.init({ hr: 5, vs: 7 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,false, true,true,false ];
            assert.deepEqual(got, exp, 'hr=5, vs=7');
            hunter.init({ hr: 6, vs: 1 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,true, true,false,false ];
            assert.deepEqual(got, exp, 'hr=6, vs=1');
            hunter.init({ hr: 6, vs: 5 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,true, true,false,false ];
            assert.deepEqual(got, exp, 'hr=6, vs=5');
            hunter.init({ hr: 6, vs: 6 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,true, true,true,false ];
            assert.deepEqual(got, exp, 'hr=6, vs=6');
            hunter.init({ hr: 6, vs: 7 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,true, true,true,false ];
            assert.deepEqual(got, exp, 'hr=6, vs=7');
            hunter.init({ hr: 7, vs: 1 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,true, true,false,false ];
            assert.deepEqual(got, exp, 'hr=7, vs=1');
            hunter.init({ hr: 7, vs: 5 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,true, true,false,false ];
            assert.deepEqual(got, exp, 'hr=7, vs=5');
            hunter.init({ hr: 7, vs: 6 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,true, true,true,false ];
            assert.deepEqual(got, exp, 'hr=7, vs=6');
            hunter.init({ hr: 7, vs: 7 });
            got = equips.map(e => e.isEnabled(hunter));
            exp = [ true,true,true, true,true,true, true,true,false ];
            assert.deepEqual(got, exp, 'hr=7, vs=7');
        });
    });

    describe('Equip#simuData()', () => {
        it('should return simuData', () => {
            let list = ['ジンオウメイル',0,1,3,0,3,5,21,109,0,-2,2,-4,1,'本気',3,'雷属性攻撃',1,'気配',-2,null,null,null,null,'雷狼竜の帯電毛',1,'雷狼竜の甲殻',2,'雷狼竜の蓄電殻',2,'雷光虫',10];

            let equip = new model.Equip(list);
            let got = equip.simuData();
            let exp = {
                name: 'ジンオウメイル',
                slot: 0,
                skillComb: { '本気': 3, '雷属性攻撃': 1, '気配': -2 }
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('Equip#enabled()', () => {
        it('should return enabled equips', () => {
            let hunter = new Hunter();

            data.equips.head = [
                [ '両/両/r/s/HR3/★6','0','0','4','0','3','6' ],
                [ '両/剣/r/s/HR3/★6','0','1','4','0','3','6' ],
                [ '両/ガ/r/s/HR3/★6','0','2','4','0','3','6' ],

                [ '男/両/r/s/HR3/★6','1','0','4','0','3','6' ],
                [ '男/剣/r/s/HR3/★6','1','1','4','0','3','6' ],
                [ '男/ガ/r/s/HR3/★6','1','2','4','0','3','6' ],

                [ '女/両/r/s/HR3/★6','2','0','4','0','3','6' ],
                [ '女/剣/r/s/HR3/★6','2','1','4','0','3','6' ],
                [ '女/ガ/r/s/HR3/★6','2','2','4','0','3','6' ]
            ];
            model.equips.initialize();
            let equips = model.equips.enabled('head', hunter);
            let got = equips.map(e => e.name);
            let exp = [
                '両/両/r/s/HR3/★6',
                '両/剣/r/s/HR3/★6',
                '男/両/r/s/HR3/★6',
                '男/剣/r/s/HR3/★6'
            ];
            assert.deepEqual(got, exp);

            data.equips.body = [];
            model.equips.initialize();
            got = model.equips.enabled('body', hunter);
            assert.deepEqual(got, []);

            data.initialize();
            model.equips.initialize();
        });

        it('should throw exception in some case', () => {
            let got;
            try { model.equips.enabled(); } catch (e) { got = e.message; }
            assert(got === 'part is required');

            try { model.equips.enabled('hoge'); } catch (e) { got = e.message; }
            assert(got === 'unknown part: hoge');
        });
    });

    describe('Equip#get()', () => {
        it('should return equip', () => {
            let eq = model.equips.get('head', 'シルバーソルヘルム,0,0');
            assert(eq);
            assert(eq.id === 'シルバーソルヘルム,0,0');
        });

        it('should return null in some case', () => {
            let got = model.equips.get('head', null);
            assert(got === null);

            got = model.equips.get('head', 'nonexistent');
            assert(got === null);
        });
        
        it('should throw exception in some case', () => {
            let got;
            try { model.equips.get(); } catch (e) { got = e.message; }
            assert(got === 'part is required');
            try { model.equips.get('hoge'); } catch (e) { got = e.message; }
            assert(got === 'unknown part: hoge');
        });
    });

    describe('Deco#constructor()', () => {
        it('should create deco', () => {
            let list = [
                '名前','レア度',2,5,6,'スキル系統1',21,'スキル系統2',22,
                '生産素材A1','個数','生産素材A2','個数','生産素材A3','個数','生産素材A4','個数',
                '生産素材B1','個数','生産素材B2','個数','生産素材B3','個数','生産素材B4','個数'
            ];

            let deco = new model.Deco(list);
            assert(deco);

            assert(deco.name === '名前');
            // レア度
            assert(deco.slot === 2);
            assert(deco.availableHR === 5);
            assert(deco.availableVS === 6);
            assert(deco.skillTree1 === 'スキル系統1');
            assert(deco.skillPt1 === 21);
            assert(deco.skillTree2 === 'スキル系統2');
            assert(deco.skillPt2 === 22);
            // 生産素材A1
            // 個数
            // 生産素材A2
            // 個数
            // 生産素材A3
            // 個数
            // 生産素材A4
            // 個数
            // 生産素材B1
            // 個数
            // 生産素材B2
            // 個数
            // 生産素材B3
            // 個数
            // 生産素材B4
            // 個数
        });

        it('should create deco is null or etc', () => {
            let deco = new model.Deco();
            assert(deco.name === null);

            deco = new model.Deco(null);
            assert(deco.name === null);

            deco = new model.Deco([]);
            assert(deco.name === null);
        });
    });

    describe('Deco#toString()', () => {
        it('should return string', () => {
            let list = ['攻撃珠【１】',4,1,2,2,'攻撃',1,'防御',-1,'水光原珠',1,'ジャギィの鱗',2,'怪力の種',1,null,null,null,null,null,null,null,null,null,null];

            let deco = new model.Deco(list);
            assert(deco.toString() === '攻撃珠【１】');
        });
    });

    describe('Deco#isEnabled()', () => {
        it('should return true if deco is enabled', () => {
            let hunter = new Hunter();

            // 名前,レア度,スロット,入手時期／HR,入手時期／村★
            let decos = [
                [ '攻撃珠【１】', '4', '1', '1', '2' ],
                [ '攻撃珠【２】', '6', '2', '2', '4' ],
                [ '攻撃珠【３】', '4', '3', '5', '99' ]
            ].map(list => new model.Deco(list));

            hunter.init({ hr: 1, vs: 1 });
            let got = decos.map(d => d.isEnabled(hunter));
            let exp = [ true, false, false ];
            assert.deepEqual(got, exp, 'hr=1, vs=1');
            hunter.init({ hr: 1, vs: 6 });
            got = decos.map(d => d.isEnabled(hunter));
            exp = [ true, true, false ];
            assert.deepEqual(got, exp, 'hr=1, vs=6');
            hunter.init({ hr: 3, vs: 1 });
            got = decos.map(d => d.isEnabled(hunter));
            exp = [ true, true, false ];
            assert.deepEqual(got, exp, 'hr=3, vs=1');
            hunter.init({ hr: 6, vs: 6 });
            got = decos.map(d => d.isEnabled(hunter));
            exp = [ true, true, true ];
            assert.deepEqual(got, exp, 'hr=6, vs=6');
        });
    });

    describe('Deco#simuData()', () => {
        it('should return simuData', () => {
            let list = ['攻撃珠【１】',4,1,2,2,'攻撃',1,'防御',-1,'水光原珠',1,'ジャギィの鱗',2,'怪力の種',1,null,null,null,null,null,null,null,null,null,null];

            let deco = new model.Deco(list);
            let got = deco.simuData();
            let exp = {
                name: '攻撃珠【１】',
                slot: 1,
                skillComb: { '攻撃': 1, '防御': -1 }
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('Deco#enabled()', () => {
        it('should return enabled decos', () => {
            let hunter = new Hunter({ hr: 1, vs: 6 });

            data.decos = [
                [ '攻撃珠【１】', '4', '1', '1', '2' ],
                [ '攻撃珠【２】', '6', '2', '2', '4' ],
                [ '攻撃珠【３】', '4', '3', '5', '99' ]
            ];
            model.decos.initialize();
            let decos = model.decos.enabled(hunter);
            let got = decos.map(d => d.name);
            let exp = [ '攻撃珠【１】', '攻撃珠【２】' ];
            assert.deepEqual(got, exp);

            data.initialize();
            model.decos.initialize();
        });
    });

    describe('Deco#get()', () => {
        it('should return deco', () => {
            let deco = model.decos.get('攻撃珠【１】');
            assert(deco);
            assert(deco.name === '攻撃珠【１】', 'name');
        });

        it('should return null in some case', () => {
            let got = model.decos.get(null);
            assert(got === null);

            got = model.decos.get('nonexistent');
            assert(got === null);
        });
    });

    describe('Skill#constructor()', () => {
        it('should create skill', () => {
            let list = [ 'スキル', 'スキル系統', 0, 1 ];

            let skill = new model.Skill(list);
            assert(skill);

            assert(skill.name === 'スキル');
            assert(skill.tree === 'スキル系統');
            assert(skill.point === 0);
            assert(skill.type === 1);
        });

        it('should create skill if null or etc', () => {
            let skill = new model.Equip();
            assert(skill.name === null);

            skill = new model.Equip(null);
            assert(skill.name === null);

            skill = new model.Equip([]);
            assert(skill.name === null);
        });
    });

    describe('Skill#simuData()', () => {
        it('should return simuData', () => {
            let list = ['攻撃力UP【大】','攻撃',20,0];

            let skill = new model.Skill(list);
            let got = skill.simuData();
            let exp = {
                name: '攻撃力UP【大】',
                tree: '攻撃',
                point: 20
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('Skill#enabled()', () => {
        it('should return enabled skills', () => {
            data.skills = [
                [ '攻撃力UP【小】', '攻撃', 10, 0 ],
                [ '攻撃力UP【中】', '攻撃', 15, 0 ],
                [ '攻撃力UP【大】', '攻撃', 20, 0 ]
            ];
            model.skills.initialize();
            let skills = model.skills.enabled();
            let got = skills.map(s => s.name);
            let exp = [ '攻撃力UP【小】', '攻撃力UP【中】', '攻撃力UP【大】' ];
            assert.deepEqual(got, exp);

            data.initialize();
            model.skills.initialize();
        });
    });

    describe('Skill#get()', () => {
        it('should return skill', () => {
            let skill = model.skills.get('攻撃力UP【大】');
            assert(skill);
            assert(skill.name === '攻撃力UP【大】');
            assert(skill.tree === '攻撃');
            assert(skill.point === 20);
            assert(skill.type === 0);
        });

        it('should return null if null or etc', () => {
            let got = model.skills.get();
            assert(got === null);

            got = model.skills.get(null);
            assert(got === null);

            got = model.skills.get('nonexistent');
            assert(got === null);
        });
    });

    describe('Oma#constructor()', () => {
        it('should create oma', () => {
            let list = [ '龍の護石',3,'匠',4,'氷耐性',-5 ];
            let oma = new model.Oma(list);
            assert(oma);

            assert(oma.name === '龍の護石');
            assert(oma.slot === 3);
            assert(oma.skillTree1 === '匠');
            assert(oma.skillPt1 === 4);
            assert(oma.skillTree2 === '氷耐性');
            assert(oma.skillPt2 === -5);

            let got = oma.toString();
            let exp = '龍の護石(スロ3,匠+4,氷耐性-5)';
            assert(got === exp);
        });

        it('should create oma if skill2 is null', () => {
            let list = [ '龍の護石','3','痛撃溜','4' ];
            let oma = new model.Oma(list);
            assert(oma.skillTree2 === null);
            assert(oma.skillPt2 === 0);

            let got = oma.toString();
            let exp = '龍の護石(スロ3,痛撃溜+4)';
            assert(got === exp);
        });

        it('should create oma if null or etc', () => {
            let oma = new model.Oma();
            assert(oma.name === null);

            oma = new model.Oma(null);
            assert(oma.name === null);

            oma = new model.Oma([]);
            assert(oma.name === null);
        });
    });

    describe('Oma#simuData()', () => {
        it('should return simuData', () => {
            let oma = new model.Oma([ '龍の護石',3,'匠',4,'氷耐性',-5 ]);
            let got = oma.simuData();
            let exp = {
                name: '龍の護石(スロ3,匠+4,氷耐性-5)',
                slot: 3,
                skillComb: { '匠': 4, '氷耐性': -5 }
            };
            assert.deepEqual(got, exp);
        });
    });
});
