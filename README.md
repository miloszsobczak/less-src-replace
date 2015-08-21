less-src-replace
========================
> Copy all local *src* files into one flatten structure and replaces paths relatively in final CSS file.

First of all, big thanks for [less-plugin-inline-urls](https://www.npmjs.com/package/less-plugin-inline-urls), which allows me to understand Visitor concept in LESS.

During complex development you will be having a lot of static files (fonts, images) expanded to different directories. For instance you may have:
+ bower directory
+ npm directory
+ local static files for different places in your app (ex. bundles in php symphony app)

Thanks to this plugin you will be able to keep expanded structure, but all of them are copied in flatten way for each LESS loaders.
## Usage

### Instalation
```shell
npm install --save-dev less-src-replace
```
## API
less-src-replace ought to be called with `Object` with *keys* as follows:
#### dest
Type: `String`

Destination path where all static files should be copied into one directory.
```javascript
{
    dest: __dirname + 'app/assets/static',
    ...
}
```
#### finalCSSPath
Type: `String`

Path of your final css needed to create relative src paths to all statics already copied.
```javascript
{
    finalCSSPath: __dirname + 'app/assets/css',
    ...
}
```
This will cause that src paths in CSS would be looking like this:
`url: src('../static')`

#### ignore
Type: `Array` optional

Array of paths that should be ignored during copy process.
```javascript
{
    ignore: [__dirname + '/vendor']
    ...
}
```
This will cause that files in this directory won't be copied, path will keep relativity from final CSS.

## Example Gulpfile
```javascript
var getSrcFilesManager = require('less-src-replace');
    cssPath = __dirname + 'web/assets/css';

gulp.task('compileLESS', function(){
  gulp.src(['app/bundleName/stylesheets/loaderName.less'])
    .pipe(less({
        plugins: [new getSrcFilesManager({
            dest: __dirname + 'web/assets/static',
            finalCSSPath: cssPath,
            ignore: [__dirname + 'vendor']
        })]
    }))
    .pipe(gulp.dest(cssPath));
});
```

## Nice to know
+ if your src url is remote address (starts with "//" or "~://"), obviously it won't be used
+ if your css has specific url used more than once, the file will be copied once as well
+ all of your copied static files have some random number as a prefix in file to prevent naming conflicts (and refresh cache in browser)

So your final public structure can look like (all of them are not in ignore paths):
```
.
├── css
│   └── loaderName.css
└── static
    ├── 17089248960837722-fontawesome-webfont.ttf
    ├── 19754130695946515-logo_google.png
    ├── 30828309641219676-fontawesome-webfont.woff
    ├── 33208357309922576-fontawesome-webfont.woff2
    ├── 6342896649148315-fontawesome-webfont.svg
    └── 9496213241945952-fontawesome-webfont.eot
```