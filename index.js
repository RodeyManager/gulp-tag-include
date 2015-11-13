/**
 * Created by Rodey on 2015/11/9.
 */

var fs          = require('fs'),
    path        = require('path'),
    through2    = require('through2'),
    util        = require('util'),
    PluginError = require('gulp-util').PluginError,
    Tool        = require('./lib/tools');

var PLUGIN_NAME = 'gulp-tag-include';

//正则匹配
var tagName         = 'include',
    includerRegx    = new RegExp('<' + tagName + '\\s+([\\s\\S]*?)>([\\s\\S]*?)<\\/' + tagName + '>', 'gi'),
    srcRegx         = new RegExp('\\s*src="([\\s\\S]*?)"', 'gi'),
    attrReg         = new RegExp('\\s+(\\S+)="([\\s\\S]*?)"', 'gi');


var replaceTag = function(file, $1, options){
    var ms = srcRegx.exec($1),
        src = ms[1] || '';
    srcRegx.lastIndex = 0;
    src = path.normalize(path.dirname(file.path) + path.sep + src);
    var htmlContent = Tool.getFileContent(src);

    //=========标签内容属性替换
    /**
     * exp: <includ src="assets/layout/header.html" title="html页面已引入" css="index.css"></includ>
     */
    if(options.tagAttr === true)
        htmlContent = Tool.extractTagAttr(htmlContent, $1, attrReg);

    //=========内容属性替换
    /**
     * <includ src="assets/layout/header.html">
     *     @title   = html页面已引入
     *     @css     = index.css
     * </includ>
     */
    if(options.tagContent === true)
        htmlContent = Tool.extractTagContent(htmlContent, includerRegx, $1);
    //去除空变量
    htmlContent = Tool.cleanEmptyVars(htmlContent);

    /*if(htmlContent.search(includerRegx) !== -1){
        htmlContent = htmlContent.replace(includerRegx, function($2){
            srcRegx.lastIndex = 0;
            var s = srcRegx.exec($2)[1];
            s = path.normalize(path.dirname(src) + path.sep + s);
            return  replaceCallback(s, options);
        });
    }*/

    return Tool.rtrim(htmlContent);
};

/**
 * 处理文件内容
 * @param file      要处理的文件
 * @param options   可选参数
 * @returns {*}
 */
var replaceCallback = function(file, options){

    var content = file.contents.toString('utf-8'),
        filePath = file.path;
    if(typeof content === 'undefined'){
        content = Tool.getFileContent(filePath);
    }

    if(options.tagName){
        includerRegx    = new RegExp('<' + options.tagName + '\\s+([\\s\\S]*?)>([\\s\\S]*?)<\\/' + options.tagName + '>', 'gi');
    }

    content = content.replace(includerRegx, function($1){

        return replaceTag(file, $1, options);

    });

    return content;

};

//获取文件内容
var getContent = function(file, options){
    //默认参数
    //tagAttr：标签上的属性
    //tagContent： 标签内的属性
    //Learn more as README.md
    var opts = options || { };
    opts['tagAttr'] = true;
    opts['tagContent'] = true;
    //对内容进行处理
    var content = replaceCallback(file, opts);
    return content;
};

var includer = function(options){

    return through2.obj(function(file, enc, next){

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return next(null, file);
        }
        if (file.isBuffer()) {
            try {
                var content = getContent(file, options);
                //console.log(content);
                file.contents = new Buffer(content);
            }
            catch (err) {
                this.emit('error', new PluginError(PLUGIN_NAME, ''));
            }
        }
        this.push(file);
        return next();


    });

};


module.exports = includer;