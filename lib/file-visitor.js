'use strict';

module.exports = function(less) {
    var ParamStringReplacementNode = require('./param-replacement')(less);

    function SrcReplacement(options) {
        this._visitor = new less.visitors.Visitor(this);
        this.options = options;
    }

    SrcReplacement.prototype = {
        isReplacing: true,
        isPreEvalVisitor: true,
        run: function (root) {
            return this._visitor.visit(root);
        },
        visitRule: function (ruleNode) {
            this._inRule = true;
            return ruleNode;
        },
        visitRuleOut: function () {
            this._inRule = false;
        },
        visitUrl: function (URLNode) {
            var options = this.options;
            if (!this._inRule) {
                return URLNode;
            }
            if (URLNode.value && URLNode.value.value && URLNode.value.value.indexOf('#') === 0) {
                // Might be part of a VML url-node value like:
                // ``behavior:url(#default#VML);``
                return URLNode;
            }
            return new less.tree.Call('url', [new ParamStringReplacementNode(URLNode.value, options)], URLNode.index || 0, URLNode.currentFileInfo);
        }
    };
    return SrcReplacement;
};
