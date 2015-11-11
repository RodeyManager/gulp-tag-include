/**
 * Created by Rodey on 2015/11/11.
 *
 * test for BDD
 */

var fs      = require('fs'),
    path    = require('path'),
    util    = require('util'),
    Tool    = require('../lib/tools'),
    include = require('../index');
    require('should');

var tagName         = 'include',
    includerRegx    = new RegExp('<' + tagName + '\\s+([\\s\\S]*?)>([\\s\\S]*?)<\\/' + tagName + '>', 'gi'),
    srcRegx         = new RegExp('\\s*src="([\\s\\S]*?)"', 'gi'),
    attrReg         = new RegExp('\\s+(\\S+)="([\\s\\S]*?)"', 'gi'),
    line            = '<include src="assets/layout/header.html" title="gulp-html-includer" css="assets/css/a.css" charset="utf-8"></include>';

describe('Tools', function(){

    //test trim
    it('Tool.trim should be success', function(){
        Tool.trim(' abc ').should.eql('abc');
    });

    //test rtrim
    it('Tool.rtrim should be success', function(){
        Tool.rtrim('\n\r\t1560\n\r\t').should.eql('1560');
    });

    //test parseData
    it('Tool.parseData should be success', function(){
        var data = { a: 2, b: '..' };
        var pd = Tool.parseData(data);
        pd.should.eql(' a=2 b=..');
    });

    //test getVarLine
    var file = 'example/src/build.html',
        content = fs.readFileSync(file, 'utf8'),
        ms = content.match(includerRegx);

    it('Tool.getVarline match regexp should be success', function(){
        //测试是否匹配
        content.should.match(includerRegx);

    });

    it('Tool.getVarline match regexp is Array type should be success', function(){
        //console.log(ms);
        ms.should.be.an.instanceof(Array);
    });

    it('Tool.getVarline match regexp in content lenght should be success', function(){
        ms.should.be.have.length(2);
    });

    //test getExtname
    it('Tool.getExtname should be success', function(){
        Tool.getExtname(file).should.equal('html');
    });

});

