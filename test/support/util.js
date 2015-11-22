'use strict';

// 頑シミュさんの装飾品検索の結果と比較しやすくする
function simplifyDecombs(decombs) {
    return decombs.map(decomb => {
        let torsoUp = Object.keys(decomb).map(part => decomb[part]).some(comb => {
            if (comb == null) return false;
            return comb.skills['胴系統倍加'] ? true : false;
        });
        let names = [];
        Object.keys(decomb).forEach(part => {
            let comb = decomb[part];
            let decos = comb ? comb.decos : [];
            if (torsoUp && part === 'body') decos = decos.map(deco => deco += '(胴)');
            names = names.concat(decos);
        });
        return names.sort().join(',');
    });
}
exports.simplifyDecombs = simplifyDecombs;
