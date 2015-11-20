var fs = require('fs');
var path = require('path');
var uuid = require('uuid');

function getPreferences() {
  var rcFilepath = path.join(USER_HOME, ".rodeorc");
  var rc = {};
  if (fs.existsSync(rcFilepath)) {
    rc = fs.readFileSync(rcFilepath).toString();
    rc = JSON.parse(rc);
  } else {
    rc = {};
  }

  if (rc.id==null) {
    rc.id = uuid.v1().replace(/-/g, "").toString();
    writePreferences(rc);
  }

  return rc;
}

function writePreferences(rc) {
  var rcFilepath = path.join(USER_HOME, ".rodeorc");
  fs.writeFileSync(rcFilepath, JSON.stringify(rc, null, 2));
}

function setPreferences(key, value) {
  var rcFilepath = path.join(USER_HOME, ".rodeorc");
  var prefs = getPreferences();
  prefs[key] = value;
  fs.writeFileSync(rcFilepath, JSON.stringify(prefs, null, 2));
}

module.exports.getPreferences = getPreferences;
module.exports.setPreferences = setPreferences;
