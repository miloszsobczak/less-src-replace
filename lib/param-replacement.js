'use strict';

var getFileService = require('./file-service'),
    path = require('path'),
    fs = require('fs');

module.exports = function(less) {
    var replacedPaths = {};

    function isPathExisting(url){
        return fs.existsSync(path.resolve(url));
    }

    function ParamReplacement(subNode, options) {
        this.value = subNode;
        this.fileService = new getFileService(options);
    }
    ParamReplacement.prototype.accept = function (visitor) {
        this.value = visitor.visit(this.value);
    };

    ParamReplacement.prototype.type = 'ParamReplacement';
    ParamReplacement.prototype.eval = function(context) {
        var quoted = this.value.eval(context);
        if (!isPathExisting(quoted.value)){
            return quoted;
        }
        var fileName = quoted.value.replace(/\?\S*/g, ''),
            filePath = path.join(path.dirname(quoted.currentFileInfo.filename), fileName);

        if (replacedPaths.hasOwnProperty(filePath)){
            quoted.value = replacedPaths[filePath];
            return quoted;
        }
        this.fileService.setFilePath(filePath);
        this.fileService.copyFile(function (err){
            if (err){
                throw err;
            }
        });
        replacedPaths[filePath] = this.fileService.getRelativeCSSPathName();
        quoted.value = replacedPaths[filePath];
        return quoted;
    };
    
    return ParamReplacement;
};