const path = require('path');
const fs = require('fs');

/**
 * load data from json file
 */
function loadJson(filePath) {
    filePath = correctPath(filePath);
    try {
        if (/\.js$/i.test(filePath)) {
            let data = require(filePath);
            if (Object.prototype.toString.call(data) !== '[object Object]') {
                console.log('load data error, values must be an object');
                return {};
            }
            return data;
        } else {
            let data = fs.readFileSync(filePath);
            return JSON.parse(data);
        }
    } catch (e) {
        console.log('load data error, ', e);
        return {};
    }
}

/**
 * make sure the filepath is an absolute path 
 */
function correctPath(filePath) {
    if (!filePath) {
        return;
    }
    filePath = filePath.replace(/\\/g, '/');
    if (path.relative(filePath)) {
        return path.join(process.cwd(), filePath);
    } else {
        return filePath;
    }
}

module.exports = {
    correctPath,
    loadJson
}