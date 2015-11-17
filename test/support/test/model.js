'use strict';
const assert = require('power-assert');
const model = require('../lib/driver-model');
const Hunter = require('../lib/driver-hunter');

describe('test-driver/model', () => {
    describe('model.makeObject()', () => {
        it('should make object', () => {
            let got = model.makeObject([ 'id', 'name' ], [ 'ID', '名前' ]);
            let exp = { id: 'ID', name: '名前' };
            assert.deepStrictEqual(got, exp);
        });

        it('should make object if specify numProps', () => {
            let props = [ 'id', 'name', 'num' ];
            let values = [ 'ID', '名前', '0' ];
            let numProps = { num: true };

            let got = model.makeObject(props, values, numProps);
            let exp = { id: 'ID', name: '名前', num: 0 };
            assert.deepStrictEqual(got, exp);
        });

        it('should make object if values is undefined', () => {
            let props = [ 'id', 'name', 'num' ];
            let values;

            let got = model.makeObject(props, values);
            let exp = { id: null, name: null, num: null };
            assert.deepStrictEqual(got, exp);

            let numProps = { num: true };
            got = model.makeObject(props, values, numProps);
            exp = { id: null, name: null, num: 0 };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if num prop is not a number', () => {
            let props = [ 'num' ];
            let values = [ 'not a number' ];
            let numProps = { num: true };
            let got;
            try { model.makeObject(props, values, numProps); } catch (e) { got = e.message; }
            assert(got === 'num is NaN');
        });
    });

    describe('model.makeSkillComb()', () => {
        it('should make skillComb', () => {
            let data = { id: 'ID', name: '名前',
                         skillTree1: 'スキル系統1', skillPt1: 1 };

            let got = model.makeSkillComb(data);
            let exp = { 'スキル系統1': 1 };
            assert.deepStrictEqual(got, exp);
        });
    });

    function pick(/* obj, ...arg */) {
        let args = Array.prototype.slice.apply(arguments);
        let obj = args.shift();
        let ret = {};
        if (args.length === 1 && Array.isArray(args[0])) args = args[0];
        args.forEach(prop => ret[prop] = obj[prop]);
        return ret;
    }

    describe('Equip#constructor()', () => {
        it('should create equip', () => {
            let data = [
                '名前',0,1,'レア度',2,5,6,
                '初期防御力','最終防御力','火耐性','水耐性','氷耐性','雷耐性','龍耐性',
                'スキル系統1',21,'スキル系統2',22,'スキル系統3',23,
                'スキル系統4',24,'スキル系統5',25,
                '生産素材1','個数','生産素材2','個数','生産素材3','個数','生産素材4','個数'
            ];

            let eq = new model.Equip(data);
            assert(eq);

            let got = pick(eq, model.Equip.props);
            let exp = {
                name: '名前', sex: 0, type: 1, rarity: 'レア度', slot: 2,
                availableHR: 5, availableVS: 6,
                skillTree1: 'スキル系統1', skillPt1: 21,
                skillTree2: 'スキル系統2', skillPt2: 22,
                skillTree3: 'スキル系統3', skillPt3: 23,
                skillTree4: 'スキル系統4', skillPt4: 24,
                skillTree5: 'スキル系統5', skillPt5: 25
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create equip if no arguments', () => {
            let eq = new model.Equip();
            assert(eq);

            let got = pick(eq, model.Equip.props);
            let exp = {
                name: null, sex: 0, type: 0, rarity: null, slot: 0,
                availableHR: 0, availableVS: 0,
                skillTree1: null, skillPt1: 0,
                skillTree2: null, skillPt2: 0,
                skillTree3: null, skillPt3: 0,
                skillTree4: null, skillPt4: 0,
                skillTree5: null, skillPt5: 0
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Equip#isEnabled()', () => {
        let hunter = new Hunter();

        it('should return true or false correctly depend on sex and type', () => {
            // 名前,"性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",レア度,スロット数,入手時期／HR（99=集会場入手不可）,入手時期／村★（99=村入手不可）
            let equips = [
                [ '両/両/r/s/HR3/★6',0,0,4,0,3,6 ],
                [ '両/剣/r/s/HR3/★6',0,1,4,0,3,6 ],
                [ '両/ガ/r/s/HR3/★6',0,2,4,0,3,6 ],

                [ '男/両/r/s/HR3/★6',1,0,4,0,3,6 ],
                [ '男/剣/r/s/HR3/★6',1,1,4,0,3,6 ],
                [ '男/ガ/r/s/HR3/★6',1,2,4,0,3,6 ],

                [ '女/両/r/s/HR3/★6',2,0,4,0,3,6 ],
                [ '女/剣/r/s/HR3/★6',2,1,4,0,3,6 ],
                [ '女/ガ/r/s/HR3/★6',2,2,4,0,3,6 ]
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
        });

        it('should return true or false correctly depend on hr and vs', () => {
            let equips = [
                [ '両/両/r/s/HR1/★1',0,0,4,0,1,1 ],
                [ '両/両/r/s/HR1/★6',0,0,4,0,1,6 ],
                [ '両/両/r/s/HR1/★99',0,0,4,0,1,99 ],

                [ '両/両/r/s/HR6/★1',0,0,4,0,6,1 ],
                [ '両/両/r/s/HR6/★6',0,0,4,0,6,6 ],
                [ '両/両/r/s/HR6/★99',0,0,4,0,6,99 ],

                [ '両/両/r/s/HR99/★1',0,0,4,0,99,1 ],
                [ '両/両/r/s/HR99/★6',0,0,4,0,99,6 ],
                [ '両/両/r/s/HR99/★99',0,0,4,0,99,99 ]
            ].map(list => new model.Equip(list));

            hunter.init({ hr: 1, vs: 1 });
            let got = equips.map(e => e.isEnabled(hunter));
            let exp = [ true,true,true, true,false,false, true,false,false ];
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
            let data = ['ジンオウメイル',0,1,3,0,3,5,21,109,0,-2,2,-4,1,'本気',3,'雷属性攻撃',1,'気配',-2,null,null,null,null,'雷狼竜の帯電毛',1,'雷狼竜の甲殻',2,'雷狼竜の蓄電殻',2,'雷光虫',10];

            let equip = new model.Equip(data);
            let got = equip.simuData();
            let exp = {
                name: 'ジンオウメイル',
                slot: 0,
                skillComb: { '本気': 3, '雷属性攻撃': 1, '気配': -2 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Deco#constructor()', () => {
        it('should create deco', () => {
            let data = [
                '名前','レア度',2,5,6,'スキル系統1',21,'スキル系統2',22,
                '生産素材A1','個数','生産素材A2','個数','生産素材A3','個数','生産素材A4','個数',
                '生産素材B1','個数','生産素材B2','個数','生産素材B3','個数','生産素材B4','個数'
            ];

            let deco = new model.Deco(data);
            assert(deco);

            let got = pick(deco, model.Deco.props);
            let exp = {
                name: '名前', slot: 2,
                availableHR: 5, availableVS: 6,
                skillTree1: 'スキル系統1', skillPt1: 21,
                skillTree2: 'スキル系統2', skillPt2: 22
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create deco if no arguments', () => {
            let deco = new model.Deco();
            assert(deco);

            let got = pick(deco, model.Deco.props);
            let exp = {
                name: null, slot: 0,
                availableHR: 0, availableVS: 0,
                skillTree1: null, skillPt1: 0,
                skillTree2: null, skillPt2: 0
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Deco#isEnabled()', () => {
        let hunter = new Hunter();

        it('should return true or false correctly depend on hr and vs', () => {
            // 名前,レア度,スロット,入手時期／HR,入手時期／村★
            let decos = [
                [ '攻撃珠【１】', 4, 1, 1, 2 ],
                [ '攻撃珠【２】', 6, 2, 2, 4 ],
                [ '攻撃珠【３】', 4, 3, 5, 99 ]
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
            let data = ['攻撃珠【１】',4,1,2,2,'攻撃',1,'防御',-1,'水光原珠',1,'ジャギィの鱗',2,'怪力の種',1,null,null,null,null,null,null,null,null,null,null];

            let deco = new model.Deco(data);
            let got = deco.simuData();
            let exp = {
                name: '攻撃珠【１】',
                slot: 1,
                skillComb: { '攻撃': 1, '防御': -1 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Skill#constructor()', () => {
        it('should create skill', () => {
            let data = [ 'スキル', 'スキル系統', 0, 1 ];

            let skill = new model.Skill(data);
            assert(skill);

            let got = pick(skill, model.Skill.props);
            let exp = {
                name: 'スキル',
                tree: 'スキル系統', point: 0,
                type: 1
            };
        });

        it('should create skill if no arguments', () => {
            let skill = new model.Skill();
            assert(skill);

            let got = pick(skill, model.Skill.props);
            let exp = { name: null, tree: null, point: 0, type: 0 };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Skill#simuData()', () => {
        it('should return simuData', () => {
            let skill = new model.Skill(['攻撃力UP【大】','攻撃',20,0]);
            let got = skill.simuData();
            let exp = {
                name: '攻撃力UP【大】',
                tree: '攻撃',
                point: 20
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Oma#constructor()', () => {
        it('should create oma', () => {
            let data = [ '龍の護石',3,'匠',4,'氷耐性',-5 ];

            let oma = new model.Oma(data);
            assert(oma);

            let got = pick(oma, model.Oma.props);
            let exp = {
                name: '龍の護石',
                slot: 3,
                skillTree1: '匠', skillPt1: 4,
                skillTree2: '氷耐性', skillPt2: -5
            };

            got = oma.toString();
            exp = '龍の護石(スロ3,匠+4,氷耐性-5)';
            assert(got === exp);
        });

        it('should create oma if skill2 is null', () => {
            let oma = new model.Oma([ '龍の護石','3','痛撃','4' ]);
            let got = pick(oma, model.Oma.props);
            let exp = {
                name: '龍の護石',
                slot: 3,
                skillTree1: '痛撃', skillPt1: 4,
                skillTree2: null, skillPt2: 0
            };
            assert(oma.skillTree2 === null);
            assert(oma.skillPt2 === 0);

            got = oma.toString();
            exp = '龍の護石(スロ3,痛撃+4)';
            assert(got === exp);
        });

        it('should create oma if no arguments', () => {
            let oma = new model.Oma();
            assert(oma);

            let got = pick(oma, model.Oma.props);
            let exp = {
                name: null,
                slot: 0,
                skillTree1: null, skillPt1: 0,
                skillTree2: null, skillPt2: 0
            };
            assert.deepStrictEqual(got, exp);
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
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Dig#constructor()', () => {
        it('should create dig', () => {
            let data = [ 0, 1, '刀匠', 4 ];

            let dig = new model.Dig(data);
            assert(dig);

            let got = {};
            model.Dig.props.forEach(prop => got[prop] = dig[prop]);
            let exp = {
                name: '発掘(刀匠+4)', sex: 0, type: 1, slot: 0,
                skillTree1: '刀匠', skillPt1: 4
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create equip if no arguments', () => {
            let dig = new model.Dig();
            assert(dig);

            let got = {};
            model.Dig.props.forEach(prop => got[prop] = dig[prop]);
            let exp = {
                name: '発掘(null+0)', sex: 0, type: 0, slot: 0,
                skillTree1: null, skillPt1: 0
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Dig#isEnabled()', () => {
        it('should return true if equip is enabled', () => {
            let hunter = new Hunter();

            // "性別(0=両,1=男,2=女)","タイプ(0=両方,1=剣士,2=ガンナー)",スキル系統1,スキル値1
            let digs = [
                [ '0','0','強欲','6' ],
                [ '0','1','刀匠','4' ],
                [ '0','2','射手','4' ]
            ].map(data => new model.Dig(data));

            hunter.init({ sex: 'm', type: 'k' });
            let got = digs.map(d => d.isEnabled(hunter));
            let exp = [ true,true,false ];
            assert.deepEqual(got, exp, 'm k');
            hunter.init({ sex: 'w', type: 'g' });
            got = digs.map(d => d.isEnabled(hunter));
            exp = [ true,false,true ];
            assert.deepEqual(got, exp, 'w g');
        });
    });

    describe('Dig#simuData()', () => {
        it('should return simuData', () => {
            let dig = new model.Dig([ 0, 1, '刀匠', 4 ]);
            let got = dig.simuData();
            let exp = {
                name: '発掘(刀匠+4)',
                slot: 0,
                skillComb: { '刀匠': 4 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
