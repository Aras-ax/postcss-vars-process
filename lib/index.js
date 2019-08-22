var postcss = require('postcss')
var { correctPath } = require('./util');

module.exports = postcss.plugin('postcss-vars-process', function(opts) {
    opts = opts || {};
    if (!opts.outPath) {
        throw Error('the property outPath is required');
    }
    if (opts.isExtract) {
        opts.outPath = correctPath(correctPath);
    } else {
        if (!opts.values) {
            throw Error('the property values is required');
        }
        // load data
        if (typeof opts.values === 'string') {
            opts.values = loadJson(opts.values);
        }
    }

    // Work with options here

    return function(root, result) {

        // Transform CSS AST here

    }
})