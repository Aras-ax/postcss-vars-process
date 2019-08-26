const postcss = require('postcss')
const { loadFile } = require('./util');
const plugin = 'postcss-vars-process';
const pattern = /\$\(([^()]+)\)/g;

function extend(sub, sup) {
    for (let key in sup) {
        if (sup.hasOwnProperty(key) && sub[key] === undefined || sub[key] === null) {
            sub[key] = sup[key];
        }
    }
}

const LOGTYPE = {
    WARN: 'warn',
    ERROR: 'error'
};

module.exports = postcss.plugin(plugin, function(opts) {
    opts = opts || {};
    extend(opts, { pattern, isExtract: false, splitKey: '|', logType: LOGTYPE.WARN });

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
        let filePath = opts.values;
        opts.values = loadFile(filePath);
    }

    if (opts.logType !== LOGTYPE.WARN || opts.logType !== LOGTYPE.ERROR) {
        opts.logType = LOGTYPE.WARN;
    }

    let log = {
            warn(message, rule, result) {
                rule.warn(result, message);
            },
            error(message, decl, option) {
                throw decl.error(message, option);
            }
        } [opts.logType],
        isWarn = opts.logType === LOGTYPE.WARN;

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
                if (decl.value) {
                    let replacePattern = new RegExp(opts.pattern.source);
                    while (patternMatch = opts.pattern.exec(decl.value)) {
                        let matchExp = patternMatch[1] || patternMatch[0];
                        opts.isExtract && push(matchExp);
                        matchExp = matchExp.split(opts.splitKey);
                        if (opts.values && opts.values[matchExp[0]] !== undefined) {
                            decl.value = decl.value.replace(replacePattern, opts.values[matchExp[0]]);
                        } else {
                            if (isWarn) {
                                decl.value = decl.value.replace(replacePattern, '');
                            }
                            log(`Unknown variable ${matchExp[0]}`, decl, isWarn ? result : { plugin: plugin, word: matchExp[0] });
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