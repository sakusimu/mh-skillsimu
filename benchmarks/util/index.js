'use strict';
const Timer = require('./timer');

exports.Timer = Timer;

exports.summaryN = function summaryN(bulksSet) {
    let list = Object.keys(bulksSet).map(part => {
        let bulks = bulksSet[part];
        let len = bulks == null ? 0 : bulks.length;
        return `${part}: ${len}`;
    });
    return `{ ${list.join(', ')} }`;
};

exports.dumpEquipAssems = function dumpEquipAssems(assems) {
    assems.forEach(assem => {
        let list = [];
        for (let part in assem) list.push(assem[part]);
        console.log(list.join('\t'));
    });
};
