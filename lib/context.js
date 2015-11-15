'use strict';
const parts = require('./util').parts;

/**
 * シミュレータで利用するデータをコンテキストとして持つクラス。
 *
 * 装備
 * * 防具データ
 *   + name       名前
 *   + slot       スロット数
 *   + skillComb  装備のスキルを { スキル系統: スキル値 } でまとめたもの
 *                スキル値は必ず数値(文字列はダメ)
 *                例えば「ユクモノドウギ」なら { '加護': 2, '気まぐれ': 2, '達人': 1 }
 * * お守りデータ
 *   + name       名前
 *                normalizer で、名前ごとにスキルをまとめたりするので
 *                「龍の護石」とかの同じ名前の護石だらけになるとマズイ
 *   + slot       スロット
 *   + skillComb  装飾品のスキルを { スキル系統: スキル値 } でまとめたもの
 *                スキル値は必ず数値(文字列はダメ)
 *                例えば t5k9 なら { '溜め短縮': 5, '攻撃': 9 }
 *
 * * 装飾品データ
 *   + name       名前
 *   + slot       スロット
 *   + skillComb  装飾品のスキルを { スキル系統: スキル値 } でまとめたもの
 *                スキル値は必ず数値(文字列はダメ)
 *                例えば「攻撃珠【１】」なら { '攻撃': 1, '防御': -1 }
 *
 * * スキルデータ
 *   + name   スキル名
 *   + tree   スキル系統
 *   + point  ポイント
 *            ポイントは必ず数値(文字列はダメ)
 *
 * 使い方
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
