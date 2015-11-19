mh-skillsimu
=============

Skill Simulator for MONSTER HUNTER

Skill Simulator find combinations of equipments for activated skills.

How to build
------------
Before you can build mh-skillsimu, you must install and configure the following dependencies on your machine:
* Git
* Node.js

At first, clone `mh-skillsimu` from github repository.

    $ git clone --depth=10 https://github.com/sakusimu/mh-skillsimu

And change directory.

    $ cd mh-skillsimu

Install dependence mudules.

    $ npm install

Build your `mh-skillsimu.js` in `dist` directory.

    $ npm run dist

How to use
----------
For example, the following code:
```javascript
'use strict';
const myapp = require('./test/test-driver/myapp')('mh4g');
const mhsimu = require('./index');

let simu = mhsimu(myapp.data);
let assemblies = simu.simulateEquip([ '斬れ味レベル+1', '耳栓', '集中' ]);
console.log(assemblies);
```
run:
```
$ node example.js
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
