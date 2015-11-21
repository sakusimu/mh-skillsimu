'use strict';
module.exports = function (b) {
    b._mdeps.options.modules.assert = require.resolve('core-assert');
};
