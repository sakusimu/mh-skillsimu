'use strict';

class Timer {
    constructor(simu) {
        if (simu == null) throw new Error('simu is required');
        this.simu = simu;

        this.records = {};

        [
            [ 'normalizer', 'normalize' ],
            [ 'combinator', 'combine' ],
            [ 'assembler', 'assemble' ]
        ].forEach(pair => this._spy(pair[0], pair[1]));
    }

    _spy(prop, method) {
        let obj = this.simu[prop];
        let fn = obj[method];

        obj[method] = (arg1, arg2, arg3) => {
            let p0 = Date.now();
            let ret = fn.call(obj, arg1, arg2, arg3);
            let p1 = Date.now();
            let time = p1 - p0;
            this._record(prop, time, ret);
            return ret;
        };
    }

    _record(prop, time, ret) {
        this.records[prop] = { time: time, ret: ret };
    }
}
module.exports = Timer;
