'use strict';

/**
 * シミュレータのユーザ側クラス。
 * ハンター情報のクラス。
 */
class Hunter {
    constructor() {
        this.init.apply(this, arguments);
    }

    init(hunter) {
        hunter = hunter || {};

        this.sex  = hunter.sex  || 'm'; // 'm' or 'w' (m: man, w: woman)
        this.type = hunter.type || 'k'; // 'k' or 'g' (k: kenshi, g: gunner)

        this.hr = hunter.hr || 8; // 進行度(HR)
        this.vs = hunter.vs || 6; // 進行度(村☆) vs=VillageStar
    }
}

module.exports = Hunter;
