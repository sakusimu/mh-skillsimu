'use strict';
const testdata = require('./data-loader');

/**
 * シミュレータのユーザ側クラス。
 * データを用意。
 */
class Data {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    initialize() {
        this.equips = {};
        this.equips.head  = testdata.equips.head;
        this.equips.body  = testdata.equips.body;
        this.equips.arm   = testdata.equips.arm;
        this.equips.waist = testdata.equips.waist;
        this.equips.leg   = testdata.equips.leg;
        this.decos        = testdata.decos;
        this.skills       = testdata.skills;
    }
}

module.exports = new Data();
