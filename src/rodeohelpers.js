var fs = require('fs');
var path = require('path');

global.USER_HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var rodeorc = path.join(USER_HOME, ".rodeorc");

function updateRC(key, value) {
  var rc;
  if (fs.existsSync(rodeorc)) {
    rc = JSON.parse(fs.readFileSync(rodeorc).toString());
  } else {
    rc = {};
  }
  rc[key] = value;
  fs.writeFileSync(rodeorc, JSON.stringify(rc, null, 2));
}

function getRC() {
  var rodeorc = path.join(USER_HOME, ".rodeorc");
  var rc;
  if (fs.existsSync(rodeorc)) {
    rc = JSON.parse(fs.readFileSync(rodeorc).toString())
  } else {
    rc = {};
  }
  return rc;
}

function formatFilename(filename) {
  // strange windows issue w/ javascript
  if (path.sep=="\\") {
    return filename.replace(/\\/g, '\\\\');
  } else {
    return filename;
  }
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports.getRC = getRC;
module.exports.updateRC = updateRC;
module.exports.formatFilename = formatFilename;
module.exports.escapeRegExp = escapeRegExp;
