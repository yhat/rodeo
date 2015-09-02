var fs = require('fs');
var ua = require('universal-analytics');
var uuid = require('uuid');
var utilities = require(__dirname + "/../src/utilities");
var rodeoVersion = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString()).version;

global.USER_ID;

function getUserId(fn) {
  // get id for user
  var userId;
  // check .rodeorc for rodeoid
  var rc = utilities.getRC();
  if (rc.id) {
    userId = rc.id;
    fn(null, userId);
  } else {
    require('getmac').getMac(function(err, macAddress) {
      if (err) {
        userId = uuid.v4().toString();
      } else {
        userId = require('crypto').createHash('sha1').update(macAddress, 'utf8').digest('hex')
      }
      updateRC("id", userId);
      fn(null, userId);
    });
  }
}

// opens
// exit
// commands executed
// things clicked
// shortcuts used
// errors
// python path?
// time open?
getUserId(function(err, userId) {
  global.USER_ID = userId;
});

var rc = utilities.getRC();
function track(cat, action, label, value) {
  if (rc.tracking==null || rc.trackingOn==true) {
    var tracker = ua('UA-46996803-1', USER_ID);
    // if we have internet...
    if (navigator && navigator.onLine) {
      var params = {
        an: "Rodeo",
        av: rodeoVersion,
        sr: $(window).width() + "x" + $(window).height()
      }
      tracker.event(cat, action).send();
    }
  }
}

module.exports.track = track;
