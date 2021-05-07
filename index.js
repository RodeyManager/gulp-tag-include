/**
 * Created by Rodey on 2015/11/9.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const through2 = require('through2');
const PluginError = require('plugin-error');
const uglifyjs = require('uglify-js');
const uglifycss = require('uglifycss');
const Tool = require('./lib/tools');

const PLUGIN_NAME = 'gulp-tag-include';

//正则匹配
var tagName = 'include',
  includerRegx = new RegExp(
    '<' + tagName + '\\s+([\\s\\S]*?)>([\\s\\S]*?)<\\/' + tagName + '>',
    'gi'
  ),
  includer2Regx = new RegExp(
    '\\s*@' +
      tagName +
      '\\s*\\(\\s*[\\\'|"]([\\s\\S]*?)[\\\'|"],\\s*\\{*([\\s\\S]*?)\\}*\\s*\\)',
    'gi'
  ),
  srcRegx = new RegExp('\\s*src\\s*=\\s*[\\\'|"]([\\s\\S]*?)"', 'gi'),
  attrReg = new RegExp('\\s+(\\S+)\\s*=\\s*[\\\'|"]([\\s\\S]*?)[\\\'|"]', 'gi'),
  attr2Reg = new RegExp(
    '\\s*([\\s\\S]*?)\\s*:\\s*[\\\'|"]([\\s\\S]*?)[\\\'|"],?',
    'gi'
  );

/**
 * html标签形式引入
 * @param filePath      当前页面地址
 * @param $1            匹配到的页面内容
 * @param options       可选参数
 * @returns {*}
 */
var replaceTag = function (filePath, $1, options) {
  var ms = srcRegx.exec($1),
    src = ms[1] || '',
    isCompress = options['compress'],
    extractCss = options['extractCss'],
    extractJs = options['extractJs'],
    globals = options['globals'];
  srcRegx.lastIndex = 0;
  src = path.normalize(path.dirname(filePath) + path.sep + src);
  if (!fs.existsSync(src)) {
    return $1;
  }

  var htmlContent = Tool.getFileContent(src);
  //判断文件类型--add
  var ext = path.extname(src);
  if (ext === '.css') {
    if (isCompress) {
      htmlContent = uglifycss.processString(htmlContent);
    }
    // 是否将引入的css文件合并输出到指定的单独文件中
    if (extractCss) {
      if (!path.isAbsolute(extractCss)) {
        extractCss = path.resolve(process.cwd(), extractCss);
      }
      if (!fs.existsSync(extractCss)) {
        fs.writeFileSync(extractCss, '', 'utf8');
      }
      fs.appendFileSync(extractCss, htmlContent, 'utf8');
      htmlContent = '';
    } else {
      htmlContent =
        '<style type="text/css" charset="utf-8">' + htmlContent + '</style>';
    }
  } else if (ext === '.js') {
    if (isCompress) {
      htmlContent = uglifyjs.minify(htmlContent, {}).code;
    }

    // 是否将引入的js文件合并输出到指定的单独文件中
    if (extractJs) {
      if (!path.isAbsolute(extractJs)) {
        extractJs = path.resolve(process.cwd(), extractJs);
      }
      if (!fs.existsSync(extractJs)) {
        fs.writeFileSync(extractJs, '', 'utf8');
      }
      fs.appendFileSync(extractJs, htmlContent, 'utf8');
      htmlContent = '';
    } else {
      htmlContent =
        '<script type="text/javascript" charset="utf-8" defer>' +
        htmlContent +
        '</script>';
    }
  }

  //=========标签内容属性替换
  /**
   * exp: <includ src="assets/layout/header.html" title="html页面已引入" css="index.css"></includ>
   */
  if (options.tagAttr === true)
    htmlContent = Tool.extractTagAttr(globals, htmlContent, $1, attrReg);

  //=========内容属性替换
  /**
   * <includ src="assets/layout/header.html">
   *     @title   = html页面已引入
   *     @css     = index.css
   * </includ>
   */
  if (options.tagContent === true)
    htmlContent = Tool.extractTagContent(
      globals,
      htmlContent,
      includerRegx,
      $1
    );
  //去除空变量
  htmlContent = Tool.cleanEmptyVars(htmlContent);

  //递归遍历
  if (
    htmlContent.search(includerRegx) !== -1 ||
    htmlContent.search(includer2Regx) !== -1
  ) {
    htmlContent = replaceCallback(src, htmlContent, options);
  }

  return Tool.rtrim(htmlContent);
};

/**
 * 模板方法形式引入
 * @param filePath      当前页面地址
 * @param content       引入的模板内容
 * @param src           引入的模板地址，方便递归
 * @param args          引入的参数列表
 * @param options       可选参数
 * @returns {*}
 */
var replaceMethodTag = function (filePath, src, args, options) {
  var src = path.normalize(path.dirname(filePath) + path.sep + src);
  if (!fs.existsSync(src)) {
    return src;
  }
  var htmlContent = Tool.getFileContent(src),
    args = args;
  //属性参数替换
  htmlContent = Tool.extractTagAttr(
    options['globals'],
    htmlContent,
    args,
    attr2Reg
  );
  //递归遍历替换
  if (
    htmlContent.search(includer2Regx) !== -1 ||
    htmlContent.search(includerRegx) !== -1
  ) {
    htmlContent = replaceCallback(src, htmlContent, options);
  }

  return htmlContent;
};

/**
 * 处理文件内容
 * @param filePath
 * @param content
 * @param options   可选参数
 * @returns {*}
 */
var replaceCallback = function (filePath, content, options) {
  var content = content
    /**
     * html标签形式 <include src="template src" [!args]></include>
     */
    .replace(includerRegx, function ($1) {
      return replaceTag(filePath, $1, options);
    })
    /**
     * 以模板方法的形式  @include('template src', { [!args] })
     */
    .replace(includer2Regx, function ($1, src, args) {
      return replaceMethodTag(filePath, src, args, options);
    });

  return content;
};

/**
 * 重置匹配正则
 * @param options
 */
var resetIncludeRegx = function (options) {
  var tagName = options.tagName;
  includerRegx = new RegExp(
    '<' + tagName + '\\s+([\\s\\S]*?)>([\\s\\S]*?)<\\/' + tagName + '>',
    'gi'
  );
  includer2Regx = new RegExp(
    '\\s*@' +
      tagName +
      '\\s*\\(\\s*[\\\'|"]([\\s\\S]*?)[\\\'|"],\\s*\\{*([\\s\\S]*?)\\}*\\s*\\)',
    'gi'
  );
};

//获取文件内容
var getContent = function (file, options) {
  //默认参数
  //tagAttr：标签上的属性
  //tagContent： 标签内的属性
  //Learn more as README.md
  var opts = options || {};
  opts['tagAttr'] = true;
  opts['tagContent'] = true;
  opts['tagName'] = opts.tagName || 'include';
  opts['compress'] = opts['compress'] === undefined ? true : opts['compress'];
  opts['globals'] = opts['globals'] || {};
  resetIncludeRegx(opts);
  //对内容进行处理

  var content = file.contents.toString('utf-8'),
    filePath = file.path;
  if (typeof content === 'undefined') {
    content = Tool.getFileContent(filePath);
  }

  content = replaceCallback(filePath, content, opts);
  return content;
};

var includer = function (options) {
  return through2.obj(function (file, enc, next) {
    if (file.isStream()) {
      this.emit(
        'error',
        new PluginError(PLUGIN_NAME, 'Stream content is not supported')
      );
      return next(null, file);
    }
    if (file.isBuffer()) {
      try {
        var content = getContent(file, options);
        file.contents = Buffer.from(content);
      } catch (err) {
        this.emit('error', new PluginError(PLUGIN_NAME, ''));
      }
    }
    this.push(file);
    return next();
  });
};

module.exports = includer;
