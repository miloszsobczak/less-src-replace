'use strict';

var getFileService = require('./file-service'),
    path = require('path'),
    fs = require('fs');

if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

module.exports = function(less) {
    var replacedPaths = {};

    function isPathExisting(fileContext){
        if (fileContext.value.indexOf('data') === 0 ||
            fileContext.value.indexOf('//') === 0 ||
            fileContext.value.indexOf('http') === 0) {
            return false;
        }
        var filePath = fileContext.currentFileInfo.filename,
            srcUrl = fileContext.value.replace(/\?\S*/g, '');

        return fs.existsSync(path.resolve(path.dirname(filePath), srcUrl));
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
        var quoted = this.value.eval(context),
            matches = /(\??#.+)$/.exec(quoted.value),
            suffix = '';

        if (Array.isArray(matches) && matches.length > 1) {
          suffix = matches[1];
          quoted.value = quoted.value.replace(/\??#.+$/g, '');
        }
        
        if (!isPathExisting(quoted)){
            quoted.value += suffix;
            return quoted;
        }
        var fileName = quoted.value.replace(/\?\S*/g, ''),
            filePath = path.join(path.dirname(quoted.currentFileInfo.filename), fileName);

        if (replacedPaths.hasOwnProperty(filePath)){
            quoted.value = replacedPaths[filePath] + suffix;
            return quoted;
        }
        this.fileService.setFilePath(filePath);
        this.fileService.copyFile(function (err){
            if (err){
                throw err;
            }
        });
        replacedPaths[filePath] = this.fileService.getRelativeCSSPathName();
        quoted.value = replacedPaths[filePath] + suffix;
        return quoted;
    };
    
    return ParamReplacement;
};