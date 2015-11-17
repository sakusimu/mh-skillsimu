'use strict';

function build() {
    let armors = makeArmors();
    return {
        weapon: makeWeapons(),
        head : makeArmors({ type: 0 }),
        body : armors,
        arm  : armors,
        waist: armors,
        leg  : armors
    };
}

function makeWeapons() {
    let assets = {
        '刀匠': { pt: [2,3,4], type: 1 },
        '状耐': { pt: [2,3,4], type: 1 },
        '回避': { pt: [3,4,5], type: 1 },
        '射手': { pt: [2,3,4], type: 2 },
        '怒'  : { pt: [2,3,4], type: 2 },
        '頑強': { pt: [3,4,5], type: 2 },
        '強欲': { pt: [3,4,6], type: 0 },
        '護収': { pt: [3,4,6], type: 0 }
    };

    let weapons = [];
    for (let tree in assets) {
        let a = assets[tree];
        for (let i = 0, len = a.pt.length; i < len; ++i) {
            let dig = [ 0, a.type, tree, a.pt[i] ];
            weapons.push(dig);
        }
    }

    return weapons;
}

function makeArmors(args) {
    args = args || {};

    let assets = {
        '刀匠': { pt: [2,3], type: 1 },
        '状耐': { pt: [2,3], type: 1 },
        '回避': { pt: [2,3,4], type: 1 },
        '居合': { pt: [2,3,4], type: 1 },
        '射手': { pt: [2,3], type: 2 },
        '怒'  : { pt: [2,3], type: 2 },
        '頑強': { pt: [2,3,4], type: 2 },
        '剛撃': { pt: [2,3,4], type: 2 },
        '盾持': { pt: [2,3,4], type: 0 },
        '増幅': { pt: [2,3,4], type: 0 },
        '潔癖': { pt: [2,3,4], type: 0 },
        '一心': { pt: [2,3,4], type: 0 },
        '強欲': { pt: [2,3], type: 0 },
        '護収': { pt: [2,3], type: 0 }
    };

    let armors = [];
    for (let tree in assets) {
        let a = assets[tree];
        let type = args.type == null ? a.type : args.type;
        for (let i = 0, len = a.pt.length; i < len; ++i) {
            let dig = [ 0, type, tree, a.pt[i] ];
            armors.push(dig);
        }
    }

    return armors;
}

let digs = build();
module.exports = digs;
