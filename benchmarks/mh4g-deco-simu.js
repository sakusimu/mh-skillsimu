'use strict';
const mhsimu = require('../');
const myapp = require('../test/test-driver/myapp')('mh4g');
const util = require('./util');
const simplify = require('../test/support/util').simplifyDecombs;

const DEBUG = false;
const Timer = util.Timer;

let simu = mhsimu();
let timer = new Timer(simu._deco);

let cases = () => [
    { opts: { hunter: { hr: 1, vs: 6 } }, // 装飾品を村のみにしぼる
      equip: {
          head  : myapp.equip('head', 'ガララキャップ'),  // スロ2
          body  : myapp.equip('body', 'レックスメイル'),  // スロ2
          arm   : myapp.equip('arm', 'ガルルガアーム'),   // スロ3
          waist : myapp.equip('waist', 'ゴアフォールド'), // スロ1
          leg   : myapp.equip('leg', 'アークグリーヴ'),   // スロ2
          weapon: { name: 'slot3', slot: 3 },
          charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
      },
      skills: [ '斬れ味レベル+1', '攻撃力UP【大】', '耳栓' ] },
    { equip: allslot3,
      skills: [ '斬れ味レベル+1', '砥石使用高速化' ] },
    { equip: allslot3,
      skills: [ '斬れ味レベル+1', '高級耳栓' ] }
];

const allslot3 = {
    head  : myapp.equip('head', '三眼のピアス'),
    body  : myapp.equip('body', '三眼の首飾り'),
    arm   : myapp.equip('arm', '三眼の腕輪'),
    waist : myapp.equip('waist', '三眼の腰飾り'),
    leg   : myapp.equip('leg', '三眼の足輪'),
    weapon: { name: 'slot3', slot: 3 },
    charm : myapp.charm([ '龍の護石',3,'匠',4,'氷耐性',-5 ])
};

function simulate(skillnames, equip) {
    console.log(`> [ ${skillnames.join(', ')} ]`);

    simu.init(myapp.data);
    simu.simulateDeco(skillnames, equip);

    let n = timer.records.normalizer;
    let c = timer.records.combinator;
    let a = timer.records.assembler;

    if (DEBUG) console.log(simplify(c.ret));

    console.log(`n: ${util.summaryN(n.ret)}`);
    console.log(`c: ${c.ret.length}`);
    console.log(`a: ${a.ret.length}`);

    let sumtime = n.time + c.time + a.time;
    console.log(`time: ${sumtime} (n=${n.time}, c=${c.time}, a=${a.time})`);
}

cases().forEach(args => {
    console.log(`# ${args.label || 'no label'}`);
    myapp.setup(args.opts);
    simulate(args.skills, args.equip);
});
