/**
 * Created by Rodey on 2015/11/9.
 */

var fs      = require('fs'),
    path    = require('path'),
    through = require('through2'),
    util    = require('util'),
    Tool    = require('./lib/tools');


//正则匹配
var tagName         = 'includ',
    includerRegx    = new RegExp('<' + tagName + '\\s+([\\s\\S]*?)>([\\s\\S]*?)<\\/' + tagName + '>', 'gi'),
    srcRegx         = new RegExp('\\s*src="([\\s\\S]*?)"', 'gi'),
    attrReg         = new RegExp('\\s+(\\S+)="([\\s\\S]*?)"', 'gi');

var file = './example/src/tagname.html';
var includer = function(options){

    options = options || { tagAttr: true };

    var content = Tool.getFileContent(file);
    //console.log(content);

    if(options.tagName){
        includerRegx    = new RegExp('<' + options.tagName + '\\s+([\\s\\S]*?)>([\\s\\S]*?)<\\/' + options.tagName + '>', 'gi');
    }

    content = content.replace(includerRegx, function($1){
        //console.log($1);
        var ms = srcRegx.exec($1),
            src = ms[1] || '';
        srcRegx.lastIndex = 0;
        //console.log(path.dirname(file));
        src = path.normalize(path.dirname(file) + path.sep + src);
        var htmlContent = Tool.getFileContent(src);

        //=========标签内容属性替换
        /**
         * exp: <includ src="assets/layout/header.html" title="html页面已引入" css="index.css"></includ>
         */
         htmlContent = Tool.extractTagAttr(htmlContent, $1, attrReg);

        //=========内容属性替换
        /**
         * <includ src="assets/layout/header.html">
         *     @title   = html页面已引入
         *     @css     = index.css
         * </includ>
         */
        htmlContent = Tool.extractTagContent(htmlContent, includerRegx, $1);


        //console.log(htmlContent);

        return Tool.rtrim(htmlContent);

    });

    console.log(content);

};

includer({ tagName: 'require_once' });




