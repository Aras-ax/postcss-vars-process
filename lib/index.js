const postcss = require('postcss')
const { loadJson } = require('./util');
const path = require('path');

const plugin = 'postcss-vars-process';
const pattern = /\$\(([^()]+)\)/g;

function warn(message, rule, result) {
    rule.warn(result, message);
}

function error(message, rule) {
    throw rule.error(message, { plugin });
}

function extend(sub, sup) {
    for (let key in sup) {
        if (sup.hasOwnProperty(key) && sub[key] === undefined || sub[key] === null) {
            sub[key] = sup[key];
        }
    }
}

module.exports = postcss.plugin(plugin, function(opts) {
    opts = opts || {};
    extend(opts, { pattern, isExtract: false, splitKey: '|' });

    if (typeof opts.extract === 'function') {
        opts.isExtract = true;
    }

    if (typeof opts.pattern !== 'object') {
        opts.pattern = new RegExp(opts.pattern);
    } else if (Object.prototype.toString.call(opts.pattern) !== '[object RegExp]') {
        opts.pattern = pattern;
    }

    // load data
    if (typeof opts.values === 'string') {
        opts.values = loadJson(opts.values);
    }

    // Work with options here

    return function(root, result) {
        let outVars = [];

        let push = (function(params) {
            let obj = {};
            return function add(val) {
                if (obj[val]) {
                    return;
                }
                outVars.push(val);
                obj[val] = true;
            }
        }());

        root.walkRules(function loopRule(rule) {
            loopDecl(rule, function loopDel(decl) {
                let patternMatch;
                opts.pattern.lastIndex = 0;
                if (decl.value && (patternMatch = opts.pattern.exec(decl.value))) {
                    opts.isExtract && push(patternMatch[0]);
                    patternMatch = patternMatch[1].split(opts.splitKey);
                    if (opts.values) {
                        if (opts.values[patternMatch[0]]) {
                            decl.value = decl.value.replace(opts.pattern, opts.values[patternMatch[0]]);
                        } else {
                            error(`${patternMatch[0]} is undefined`, rule);
                        }
                    }
                }
            });
        });
        opts.isExtract && opts.extract(outVars);
    }

    function loopDecl(rule, callback) {
        rule.each((node) => {
            if (node.type === 'decl') {
                callback(node);
            }

            if (node.type === 'rule' || node.type === 'atrule') {
                loopDecl(node, callback);
            }
        });
    }
})