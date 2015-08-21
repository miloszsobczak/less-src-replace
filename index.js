'use strict';
var getSrcVisitor = require('./lib/file-visitor');

function LessSrcReplace(options) {
  this.options = options;
}
LessSrcReplace.prototype = {
    install: function(less, pluginManager) {
        var SrcVisitor = getSrcVisitor(less);
        pluginManager.addVisitor(new SrcVisitor(this.options));
    },
    setOptions: function(options) {
        this.options = options || {};
    }
};

module.exports = LessSrcReplace;