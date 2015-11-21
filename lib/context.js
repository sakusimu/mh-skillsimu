'use strict';
const parts = require('./util').parts;

/**
 * シミュレータで利用するデータをコンテキストとして持つクラス。
 *
 * Context のに渡すデータは以下の通り
 *
 * * 装備データ
 *   + name    名前
 *   + slot    スロット数
 *   + skills  装備のスキルを { スキル系統: スキル値 } でまとめたもの
 *             スキル値は必ず数値(文字列はダメ)
 *             例えば「ユクモノドウギ」なら { '加護': 2, '気まぐれ': 2, '達人': 1 }
 *
 *   お守りについて
 *   お守りの name は、「龍の護石(スロ3,匠+4,氷耐性-5)」のような、お守りを一意に識別できる
 *   名前でなければならない
 *   (Normalizer で、名前ごとにスキルをまとめたりするので、「龍の護石」とかの同じ名前の
 *   護石だらけになるとマズイ)
 *
 * * 装飾品データ
 *   + name    名前
 *   + slot    スロット
 *   + skills  装飾品のスキルを { スキル系統: スキル値 } でまとめたもの
 *             スキル値は必ず数値(文字列はダメ)
 *             例えば「攻撃珠【１】」なら { '攻撃': 1, '防御': -1 }
 *
 * * スキルデータ
 *   + name   スキル名
 *   + tree   スキル系統
 *   + point  ポイント
 *            ポイントは必ず数値(文字列はダメ)
 *
 * データの例
 * * 固定装備
 *   例えば頭を固定したい場合、equips.head に固定したい装備を1つだけセットすればOK。
 *
 * * 装飾品なし
 *   装飾品なしでシミュりたい場合は decos を [] にすればOK。
 */
class Context {
    constructor() {
        this.equips = {}; // 部位ごとの装備データの配列
        for (let i = 0, len = parts.length; i < len; ++i) {
            let part = parts[i];
            this.equips[part] = [];
        }
        this.decos = []; // 装飾品データの配列
        this.skills = {}; // { スキル名: スキルデータ } のハッシュ

        this.init.apply(this, arguments);
    }

    init(data) {
        data = data || {};

        let equips = data.equips || {};
        for (let i = 0, len = parts.length; i < len; ++i) {
            let part = parts[i];
            this.equips[part] = equips[part] || [];
        }
        this.decos  = data.decos || [];
        this.skills = data.skills || {};
    }
}

module.exports = Context;
