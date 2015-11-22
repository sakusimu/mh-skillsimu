'use strict';
const mhsimu = require('../');
const myapp = require('../test/test-driver/myapp')('mh4g');
const util = require('./util');

const DEBUG = false;
const Timer = util.Timer;

let simu = mhsimu();
let timer = new Timer(simu._equip);

let cases = () => [
    { opts: { weaponSlot: 2 },
      skills: [ '斬れ味レベル+1', '集中' ] },

    { skills: [ '回避性能+3', '回避距離UP', '斬れ味レベル+1' ] },
    { skills: [ '攻撃力UP【大】', '業物' ] },
    { skills: [ '斬れ味レベル+1', '高級耳栓' ] },

    { opts: { weaponSlot: 3 },
      skills: [ '斬れ味レベル+1', '高級耳栓', '砥石使用高速化' ] },

    { label: 'not found for too many skills',
      skills: [ '攻撃力UP【大】', '業物', '集中', '見切り+1', '弱点特効' ] },

    { label: 'with charm',
      opts: { charms: charms1 },
      skills: [ '斬れ味レベル+1', '高級耳栓' ] },
    { label: 'with charm',
      opts: { charms: charms1 },
      skills: [ '斬れ味レベル+1', '高級耳栓', '砥石使用高速化' ] },
    // { label: 'with charm',
    //   opts: { charms: charms1 },
    //   skills: [ '斬れ味レベル+1', '耳栓', '砥石使用高速化' ] },

    { label: 'with dig',
      opts: { charms: charms3, dig: true },
      skills: [ '真打', '集中', '弱点特効', '耳栓' ] }
];

const charms1 = [
    [ '龍の護石',3,'匠',4,'氷耐性',-5 ]
];
const charms3 = [
    [ '龍の護石',3,'匠',4,'氷耐性',-5 ],
    [ '龍の護石',0,'溜め短縮',5,'攻撃',9 ],
    [ '龍の護石',3,'痛撃',4 ]
];

function simulate(skillnames) {
    console.log(`> [ ${skillnames.join(', ')} ]`);

    simu.init(myapp.data);
    simu.simulateEquip(skillnames);

    let n = timer.records.normalizer;
    let c = timer.records.combinator;
    let a = timer.records.assembler;

    if (DEBUG) util.dumpEquipAssems(a.ret);

    console.log(`n: ${util.summaryN(n.ret)}`);
    console.log(`c: ${c.ret.length}`);
    console.log(`a: ${a.ret.length}`);

    let sumtime = n.time + c.time + a.time;
    console.log(`time: ${sumtime} (n=${n.time}, c=${c.time}, a=${a.time})`);
}

let equips = myapp.data.equips;
let list = Object.keys(equips).map(part => `${part}: ${equips[part].length}`);
console.log(`equips: { ${list.join(', ')} }`);

cases().forEach(args => {
    console.log(`# ${args.label || 'no label'}`);
    myapp.setup(args.opts);
    simulate(args.skills);
});
