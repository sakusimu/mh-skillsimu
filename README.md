mh-skillsimu
=============

Skill Simulator for MONSTER HUNTER

Skill Simulator find combinations of equipments for activated skills.

```javascript
const mhsimu = require('mh-skillsimu');

let simu = mhsimu(mh4gdata);
let assems = simu.simulateEquip([ '斬れ味レベル+1', '耳栓', '集中' ]);
console.log(assems);
```
```
[ { head: 'ミヅハ【烏帽子】',
    body: 'アカムトウルンテ',
    arm: 'EXレックスアーム',
    waist: 'クシャナアンダ',
    leg: 'アークグリーヴ',
    weapon: null,
    charm: null },
  { head: 'ミヅハ【烏帽子】',
    body: 'アカムトウルンテ',
    arm: 'EXレックスアーム',
    waist: 'クシャナアンダ',
    leg: 'ゾディアスグリーヴ',
    weapon: null,
    charm: null } ]
```

How to build
------------
Before you build mh-skillsimu, you must install and configure following dependencies on your machine:
* Git
* Node.js

At first, clone `mh-skillsimu` from github repository.

    $ git clone --depth=10 https://github.com/sakusimu/mh-skillsimu

And change directory.

    $ cd mh-skillsimu

Install dependence modules in `./node_modules`.

    $ npm install

Build your `mh-skillsimu.js` in `dist` directory.

    $ npm run dist

Example
-------
At first, download and build test data.

    $ npm run testdata

For example, run `examples/basic.js`

`examples/basic.js`, the following code:
```javascript
'use strict';
const mhsimu = require('../');
const myapp = require('../test/test-driver/myapp')('mh4g');

let simu = mhsimu(myapp.data);
let assemblies = simu.simulateEquip([ '斬れ味レベル+1', '耳栓', '集中' ]);
console.log(assemblies);
```
```
$ node examples/basic.js
[ { head: 'ミヅハ【烏帽子】',
    body: 'アカムトウルンテ',
    arm: 'EXレックスアーム',
    waist: 'クシャナアンダ',
    leg: 'アークグリーヴ',
    weapon: null,
    charm: null },
  { head: 'ミヅハ【烏帽子】',
    body: 'アカムトウルンテ',
    arm: 'EXレックスアーム',
    waist: 'クシャナアンダ',
    leg: 'ゾディアスグリーヴ',
    weapon: null,
    charm: null } ]
```

How to use
----------
mh-skillsimu require `data`.

`data` pass as an argument to a mh-skillsimu.  
For example, the following:
```javascript
const mhsimu = require('./index');

let simu = mhsimu(data);
// or
simu.init(data)
```
You need to prepare `data`.

Specification of `data`, the following:
```javascript
// data
{
    equips: {
        head  : [ equip, ... ],
        body  : [ ... ],
        arm   : [ ... ],
        waist : [ ... ],
        leg   : [ ... ],
        weapon: [ ... ],
        charm : [ ... ]
    },
    decos: [ deco, ... ]
    skills: { 'skillname': skill, ... }
}

// equip
{
    name: 'equip name',
    slot: 'slot num',
    skills: { 'skilltree': 'skillpoint (number)', ... }
}
// e.g. head
{
    name: 'レウスヘルム', slot: 0,
    skills: { '攻撃': 3, '火属性攻撃': 1, '回復量': -2 }
}
// e.g. charm
{
    name: '龍の護石(スロ3,匠+4,氷耐性-5)', slot: 3,
    skills: { '匠': 4, '氷耐性': -5 }
}

// deco
{
    name: 'deco name',
    slot: 'slot num',
    skills: { 'skilltree': 'skillpoint (number)', ... }
}
// e.g.
{ name: '攻撃珠【１】', slot: 1, skills: { '攻撃': 1, '防御': -1 } }

// skill
{
    name: 'skillname',
    tree: 'skilltree',
    point: 'skillpoint (number)',
}
// e.g.
{ name: '攻撃力UP【大】', tree: '攻撃', point: 20 };
```
See [test/test-driver/myapp.js](https://github.com/sakusimu/mh-skillsimu/blob/master/test/test-driver/myapp.js) for more details.

Running Tests
-------------
At first, download and build test data.

    $ npm run testdata

To run all unit tests, use:

    $ npm test

To run a unit test, use:

    $ npm test test/unit/~.js

See Also
--------
* [mh4-skillsimu](https://github.com/sakusimu/mh4-skillsimu)
* [mh4g-skillsimu](https://github.com/sakusimu/mh4g-skillsimu)

Author
------
sakusimu.net

Acknowledgment
--------------
Author of GANSIMU  
When I create the simulator, I use the algorithm author of GANSIMU was published.  
[検索ロジック:MHP2G スキルシミュレータ 頑シミュ](http://www.geocities.jp/masax_mh/logic/)

License
-------
Copyright (C) 2015 sakusimu.net

Licensed under the MIT license.
