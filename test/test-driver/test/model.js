'use strict';
const assert = require('power-assert');
const model = require('../model');
const Hunter = require('../hunter');

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

    describe('model.makeSkills()', () => {
        it('should make skills', () => {
            let data = { id: 'ID', name: '名前',
                         skilltree1: 'スキル系統1', skillpoint1: 1 };

            let got = model.makeSkills(data);
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
                skilltree1: 'スキル系統1', skillpoint1: 21,
                skilltree2: 'スキル系統2', skillpoint2: 22,
                skilltree3: 'スキル系統3', skillpoint3: 23,
                skilltree4: 'スキル系統4', skillpoint4: 24,
                skilltree5: 'スキル系統5', skillpoint5: 25
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
                skilltree1: null, skillpoint1: 0,
                skilltree2: null, skillpoint2: 0,
                skilltree3: null, skillpoint3: 0,
                skilltree4: null, skillpoint4: 0,
                skilltree5: null, skillpoint5: 0
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

    describe('Equip#simudata()', () => {
        it('should return simudata', () => {
            let data = ['ジンオウメイル',0,1,3,0,3,5,21,109,0,-2,2,-4,1,'本気',3,'雷属性攻撃',1,'気配',-2,null,null,null,null,'雷狼竜の帯電毛',1,'雷狼竜の甲殻',2,'雷狼竜の蓄電殻',2,'雷光虫',10];

            let equip = new model.Equip(data);
            let got = equip.simudata();
            let exp = {
                name: 'ジンオウメイル', slot: 0,
                skills: { '本気': 3, '雷属性攻撃': 1, '気配': -2 }
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
                skilltree1: 'スキル系統1', skillpoint1: 21,
                skilltree2: 'スキル系統2', skillpoint2: 22
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
                skilltree1: null, skillpoint1: 0,
                skilltree2: null, skillpoint2: 0
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

    describe('Deco#simudata()', () => {
        it('should return simudata', () => {
            let data = ['攻撃珠【１】',4,1,2,2,'攻撃',1,'防御',-1,'水光原珠',1,'ジャギィの鱗',2,'怪力の種',1,null,null,null,null,null,null,null,null,null,null];

            let deco = new model.Deco(data);
            let got = deco.simudata();
            let exp = {
                name: '攻撃珠【１】', slot: 1, skills: { '攻撃': 1, '防御': -1 }
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
            assert.deepStrictEqual(got, exp);
        });

        it('should create skill if no arguments', () => {
            let skill = new model.Skill();
            assert(skill);

            let got = pick(skill, model.Skill.props);
            let exp = { name: null, tree: null, point: 0, type: 0 };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Skill#simudata()', () => {
        it('should return simudata', () => {
            let skill = new model.Skill(['攻撃力UP【大】','攻撃',20,0]);
            let got = skill.simudata();
            let exp = { name: '攻撃力UP【大】', tree: '攻撃', point: 20 };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Charm#constructor()', () => {
        it('should create charm', () => {
            let data = [ '龍の護石',3,'匠',4,'氷耐性',-5 ];

            let charm = new model.Charm(data);
            assert(charm);

            let got = pick(charm, model.Charm.props);
            let exp = {
                name: '龍の護石', slot: 3,
                skilltree1: '匠', skillpoint1: 4,
                skilltree2: '氷耐性', skillpoint2: -5
            };
            assert.deepStrictEqual(got, exp);

            got = charm.toString();
            exp = '龍の護石(スロ3,匠+4,氷耐性-5)';
            assert(got === exp);
        });

        it('should create charm if skill2 is null', () => {
            let charm = new model.Charm([ '龍の護石','3','痛撃','4' ]);
            let got = pick(charm, model.Charm.props);
            let exp = {
                name: '龍の護石', slot: 3,
                skilltree1: '痛撃', skillpoint1: 4,
                skilltree2: null, skillpoint2: 0
            };
            assert.deepStrictEqual(got, exp);

            got = charm.toString();
            exp = '龍の護石(スロ3,痛撃+4)';
            assert(got === exp);
        });

        it('should create charm if no arguments', () => {
            let charm = new model.Charm();
            assert(charm);

            let got = pick(charm, model.Charm.props);
            let exp = {
                name: null, slot: 0,
                skilltree1: null, skillpoint1: 0,
                skilltree2: null, skillpoint2: 0
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('Charm#simudata()', () => {
        it('should return simudata', () => {
            let charm = new model.Charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ]);
            let got = charm.simudata();
            let exp = {
                name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
                skills: { '匠': 4, '氷耐性': -5 }
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
                skilltree1: '刀匠', skillpoint1: 4
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
                skilltree1: null, skillpoint1: 0
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

    describe('Dig#simudata()', () => {
        it('should return simudata', () => {
            let dig = new model.Dig([ 0, 1, '刀匠', 4 ]);
            let got = dig.simudata();
            let exp = {
                name: '発掘(刀匠+4)', slot: 0, skills: { '刀匠': 4 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
