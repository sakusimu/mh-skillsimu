'use strict';
const mhsimu = require('../');
const myapp = require('../test/test-driver/myapp')('mh4g');

let simu = mhsimu(myapp.data);
let assemblies = simu.simulateEquip([ '斬れ味レベル+1', '耳栓', '集中' ]);
console.log(assemblies);
