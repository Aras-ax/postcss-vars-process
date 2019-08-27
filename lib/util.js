var path = require('path')
var fs = require('fs')

/**
 * load data from json file
 */
function loadFile (filePath) {
  filePath = correctPath(filePath)
  try {
    if (/\.js$/i.test(filePath)) {
      let data = require(filePath)
      if (Object.prototype.toString.call(data) !== '[object Object]') {
        console.log('load data error, values must be an object')
        return {}
      }
      return data
    } else if (/\.json$/i.test(filePath)) {
      let data = fs.readFileSync(filePath)
      return JSON.parse(data)
    } else {
      return new Error(`File type must be .js or .json`)
    }
  } catch (e) {
    throw new Error(`Unhandled option file: ${filePath}. `, e)
  }
}

/**
 * make sure the filepath is an absolute path
 */
function correctPath (filePath) {
  if (!filePath) {
    return
  }
  filePath = filePath.replace(/\\/g, '/')
  if (path.isAbsolute(filePath)) {
    return filePath
  }
  return path.join(process.cwd(), filePath)
}

module.exports = {
  correctPath,
  loadFile
}
