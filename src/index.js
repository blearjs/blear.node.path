/**
 * path
 * @author ydr.me
 * @create 2015-09-01 19:36
 */


'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var collection = require('blear.utils.collection');
var access = require('blear.utils.access');
var typeis = require('blear.utils.typeis');
var object = require('blear.utils.object');


//path.__defineGetter__      path.__defineSetter__      path.__lookupGetter__      path.__lookupSetter__      path.__proto__             path.constructor
//path.hasOwnProperty        path.isPrototypeOf         path.propertyIsEnumerable  path.toLocaleString        path.toString              path.valueOf
//path._makeLong             path.basename              path.delimiter             path.dirname               path.extname               path.format
//path.isAbsolute            path.join                  path.normalize             path.parse                 path.posix                 path.relative
//path.resolve               path.sep                   path.win32
// var extendList = [
//     'basename',
//     'delimiter',
//     'dirname',
//     'extname',
//     'format',
//     // 'isAbsolute',
//     //'join',
//     // 'normalize',
//     'parse',
//     'posix',
//     'relative',
//     'resolve',
//     'sep'
// ];



/**
 * 标准化路径
 * @param p {String} 路径
 * @returns {string}
 */
var normalize = exports.normalize = function (p) {
    return path.normalize(p).replace(/\\/g, '/');
};

var relative = function (p) {
    return /^.{1,2}\//.test(p) ? p : './' + p;
};

/**
 * 复制原始
 * @param name
 * @param [format]
 * @returns {Function}
 */
var copyFromNative = function (name, format) {
    return function () {
        var args = access.args(arguments);
        var res = path[name].apply(path, args);
        return format ? format(res) : res;
    };
};

exports.basename = copyFromNative('basename');
exports.dirname = copyFromNative('dirname');
exports.extname = copyFromNative('extname');
exports.relative = copyFromNative('relative', relative);
exports.resolve = copyFromNative('resolve');
exports.join = copyFromNative('join');

var globDefaults = {
    glob: [],
    srcDirname: null,
    globOptions: {
        dot: false,
        nodir: true
    },
    progress: null
};
/**
 * glob 分析
 * @param globArray {String|Array} 规则字符串或数组
 * @param options {Object} 配置
 * @param [options.srcDirname] {String} 原始目录
 * @param [options.globOptions] {Object} glob 配置
 * @param [options.progress] {Function} 过程回调
 * @param [options.filter] {Function} 筛选
 * @returns {Array}
 */
exports.glob = function (globArray, options) {
    var files = [];
    var map = {};

    options = object.assign(true, {}, globDefaults, options);
    globArray = typeis.Array(globArray) ? globArray : [globArray];
    options.filter = options.filter ||
        function (indexGlob, indexFile, file) {
            return true;
        };

    collection.each(globArray, function (indexGlob, p) {
        var p2 = typeis.Array(p) ? p : [p];

        collection.each(p2, function (index, p3) {
            var p4 = path.join(options.srcDirname || process.cwd(), p3);
            var _files = glob.sync(p4, options.globOptions);
            var _files2 = [];

            collection.each(_files, function (indexFile, file) {
                var file2 = normalize(file);

                if (!options.filter(indexGlob, indexFile, file)) {
                    return;
                }

                if (!map[file2]) {
                    map[file2] = true;
                    _files2.push(file2);
                }
            });

            if (typeis.Function(options.progress)) {
                collection.each(_files2, function (indexFile, file) {
                    options.progress(indexGlob, indexFile, file);
                });
            }

            files = files.concat(_files2);
        });
    });

    return files;
};


/**
 * 判断路径是为一个目录
 * @param p {String} 路径
 * @returns {boolean}
 */
exports.isDirectory = function (p) {
    var stat;

    try {
        stat = fs.statSync(p);
    } catch (err) {
        return false;
    }

    return stat.isDirectory();
};


/**
 * 判断路径是为一个文件
 * @param p {String} 路径
 * @returns {boolean}
 */
exports.isFile = function (p) {
    var stat;

    try {
        stat = fs.statSync(p);
    } catch (err) {
        return false;
    }

    return stat.isFile();
};


/**
 * 判断路径是否存在，不管是目录，还是文件
 * @param p
 * @returns {boolean}
 */
exports.isExist = function (p) {
    try {
        fs.statSync(p);
        return true;
    } catch (err) {
        return false;
    }
};
