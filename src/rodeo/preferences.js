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

function setPreferences(key, value) {
  var rcFilepath = path.join(USER_HOME, ".rodeorc");
  var prefs = getPreferences();
  prefs[key] = value;
  fs.writeFileSync(rcFilepath, JSON.stringify(prefs, null, 2));
}

module.exports.getPreferences = getPreferences;
