/**
 * Created by Rodey on 2015/11/6.
 */

var fs      = require('fs'),
    path    = require('path'),
    util    = require('util');

var Tools = function(){};

Tools.prototype = {
    //获取文件内容
    getFileContent: function(file){
        if(!fs.existsSync(file)) throw new Error('Cannot fond file: ' + file);
        return fs.readFileSync(file, 'utf8');
    },

    //根据指定的正则搜索匹配的内容
    matchs: function(str, regx){
        var ms = str.match(regx);
        return ms;
    },

    //去除首位空白
    trim: function(text){
        return text.replace(/[\n\r\t]*/gi, '').replace(/^\s*|\s*$/gi, '');
    },

    //去除收尾换行
    rtrim: function(text){
        //var regx = new RegExp('^' + coma + '*|' + coma + '*$', 'gi');
        return text.replace(/^[\n\r\t]*|[\n\r\t]*$/gi, '');
    },

    //去除空变量
    cleanEmptyVars: function(text){

        var emptyRegx = new RegExp('\\{{2}([\\s\\S]*?)\\}{2}', 'gi');
        var content = text.replace(emptyRegx, '');
        return content;
    },

    parseData: function(data){
        if(!data || 'object' !== typeof data || data === {}) return '';
        var s = '';
        for(var k in data){
            if(data[k])
                s += ' ' + k + '=' + data[k];
        }
        return s;
    },

    //获取标签内容
    getVarLine: function(regx, text){
        regx.lastIndex = 0;
        var ls = regx.exec(text);
        if(!ls || !util.isArray(ls))
            return null;
        var vs = this.rtrim(ls[2]);
        var lines = vs.split(/(;|,)[\n\r\t]*/gi);
        return lines;
    },

    //获取自定义列表
    getVars: function(texts){
        var keys = [], vals = [];
        for(var i = 0, len = texts.length; i < len; ++i){
            var one = this.trim(texts[i]); //.split(/\s*=\s*/i);
            var rg = new RegExp('\\s*([\\s\\S]*?)\\s*=\\s*([\\s\\S]*?)');

            var ms = rg.exec(one);
            rg.lastIndex = 0;

            if(one[0] && ms && util.isArray(ms)){
                keys.push(ms[1]);
                vals.push(this.trim(one.replace(ms[0], '') || ''));
            }

        }
        return { keys: keys, vals: vals };
    },

    //替换内容
    extractAttrs: function(text, keys, vals){
        var self = this;
        var content = text, attrRegx, emptyRegx;

        //替换属性
        for(var i = 0, len = keys.length; i < len; ++i){

            var key = keys[i].replace(/^@*/i, ''), value = vals[i] || '';
            attrRegx = new RegExp('\\{{2}\\s*[@|\$]*'+ key +'?\\s*}{2}', 'gi');

            content = content.replace(attrRegx, function($2){
                return value;
            });

        }
        return content;
    },

    //替换标签上属性内容
    extractTagAttr: function(htmlContent, text, attrReg){
        text = text.replace(/>[\s\S]*?<\//gi, '');
        var as, keys = [], vals = [];
        while(as = attrReg.exec(text)){
            var key = as[1],
                value = as[2];
            if(as[1]){
                keys.push(key);
                vals.push(value);
            }
        }

        //替换属性
        var content = this.extractAttrs(htmlContent, keys, vals);
        return content;
    },

    //替换标签内容属性
    extractTagContent: function(htmlContent, regx, text){
        //获取标签之间的属性内容
        var lines = this.getVarLine(regx, text);
        if(!lines && !util.isArray(lines)){
            return this.rtrim(htmlContent);
        }

        //获取属性列表
        var attrs = this.getVars(lines),
            keys = attrs['keys'],
            vals = attrs['vals'];
        if(!keys || keys.length === 0){
            return this.rtrim(htmlContent);
        }
        //替换属性
        var content = this.extractAttrs(htmlContent, keys, vals);
        return content;
    },

    //获取文件控制名
    getExtname: function(file){
        return path.extname(file).replace(/\./gi, '');
    },

    //压缩css js
    mini: function(str){
        return str.replace(/[\n|\r|\t]*/gi, '').replace(/\s*\{\s*/gi, '{').replace(/\s*\}\s*/gi, '}').replace(/\s*,\s*/gi, ',')
            .replace(/\s*;\s*/gi, ';').replace(/\s*:\s*/gi, ':').replace(/\s*\(\s*/gi, '(').replace(/\s*\)/gi, ')')
            .replace(/\s*"\s*/gi, '\"').replace(/\s*'\s*/gi, "\'").replace(/\s*\+\s*/gi, '+').replace(/\s*\*\s*/gi, '*');
    },
    miniStyle: function(styles){
        return this.mini(styles).replace(/\s*>\s*/gi, '>').replace(/\s*\[\s*/gi, '[').replace(/\s*\]\s*/gi, ']')
            .replace(/0px/gi, '0');
    },
    miniJs: function(jses){
        return this.mini(jses);
    }

};


module.exports = new Tools();