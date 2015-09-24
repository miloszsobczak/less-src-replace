'use strict';

var path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp').sync,
    md5 = require('md5');

var FileService = function FileService(options) {
    this.options = options;
    this._unlinkFilesInDirectory();
};

FileService.prototype = {
    copyFile: function copyFile(callback) {
        function done(err) {
            if (typeof callback === 'function') {
                callback(err);
            }
        }
        
        if (this._isFileWithinIgnores()) {
            return false;
        }
        var filename = path.basename(this.filePath),
            rd = fs.createReadStream(this.filePath),
            wr = null,
            randomNum = (function(filePathPrv){
                return md5(filePathPrv);
            })(this.filePath);

        if (!fs.existsSync(this.options.dest)) {
            mkdirp(this.options.dest);
        }
        do {
            filename = randomNum + '-' + path.basename(this.filePath);
            this.setFilePath(path.join(path.dirname(this.filePath), filename));
        } while (fs.existsSync(path.join(this.options.dest, path.basename(this.filePath))));

        rd.on('error', function(err) {
            done(err);
        });
        wr = fs.createWriteStream(path.join(this.options.dest, filename));
        wr.on('error', function(err) {
            done(err);
        }).on('close', function() {
            done();
        });
        rd.pipe(wr);
    },
    getRelativeCSSPathName: function getRelativeCSSPathName() {
        if (!this.options.dest || !this.options.finalCSSPath){
            return this.filePath;
        }
        var relativePath = path.relative(this.options.finalCSSPath, this.options.dest);
        if (this._isFileWithinIgnores()) {
            relativePath = path.relative(this.options.finalCSSPath, path.dirname(path.normalize(this.filePath)));
        }
        return path.join(relativePath, path.basename(this.filePath));
    },
    setFilePath: function setFilePath(filePath) {
        this.filePath = path.resolve(filePath);
    },
    _isFileWithinIgnores: function _isFileWithinIgnores(){
        if (!this.options.ignore || this.options.ignore.length === 0) {
            return false;
        }
        var ignoresLength = this.options.ignore.length,
            fileAbsolutePath = path.resolve(path.dirname(this.filePath)),
            ignoreAbsolutePath = '';

        for (var i = 0;i < ignoresLength; i++) {
            ignoreAbsolutePath = path.resolve(this.options.ignore[i]);
            if (fileAbsolutePath.indexOf(ignoreAbsolutePath) === 0) {
                return true;
            }
        }
        return false;
    },
    _unlinkFilesInDirectory: function _unlinkFilesInDirectory(){
        var destPath = path.resolve(path.normalize(this.options.dest));
        if (!fs.existsSync(this.options.dest)) {
            return;
        }
        fs.readdirSync(destPath).forEach(function(file) {
            var filePath = path.join(destPath, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                fs.rmdirSync(filePath);
            }
            else if (fs.lstatSync(filePath).isFile()){
                fs.unlinkSync(filePath);
            }
        });
    }
};
module.exports = FileService;