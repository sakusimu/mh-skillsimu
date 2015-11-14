'use strict';

/**
 * シミュレータのユーザ側クラス。
 * コンテキスト情報のクラス。
 */
class Context {
    constructor() {
        this.initialize.apply(this, arguments);
    }

    initialize(ctx) {
        ctx = ctx || {};

        this.sex  = ctx.sex  || 'm'; // 'm' or 'w' (m: man, w: woman)
        this.type = ctx.type || 'k'; // 'k' or 'g' (k: kenshi, g: gunner)

        this.hr = ctx.hr || 8; // 進行度(HR)
        this.vs = ctx.vs || 6; // 進行度(村☆) vs=VillageStar
    }
}

module.exports = Context;
