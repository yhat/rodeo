var fs = require('fs');
var path = require('path');

function getPreferences() {
  var rcFilepath = path.join(USER_HOME, ".rodeorc");
  var rc = {};
  if (fs.existsSync(rcFilepath)) {
    rc = fs.readFileSync(rcFilepath).toString();
    rc = JSON.parse(rc);
  } else {
    rc = {};
  }
  return rc;
}

module.exports.getPreferences = getPreferences;
