var fs = require('fs');
var uuid = require('uuid');
var querystring = require('querystring');
var jQuery = require('jquery');
var rodeohelpers = require(__dirname + "/../src/rodeohelpers");
var rodeoVersion = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString()).version;

global.USER_ID;

function getUserId(fn) {
  if (global.USER_ID!=null) {
    return fn(null, global.USER_ID);
  }
  // get id for user
  var userId;
  // check .rodeorc for rodeoid
  var rc = rodeohelpers.getRC();
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
;

function post(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.send(null);
}


var rc = rodeohelpers.getRC();
function track(cat, action, label, value) {
  if (rc.tracking==null || rc.trackingOn==true) {
    getUserId(function(err, userId) {
      if (global.USER_ID==null) {
        global.USER_ID = userId;
      }
      // if we have internet...
      if (navigator && navigator.onLine) {
        var params = {
          // default
          v: 1,
          tid: 'UA-46996803-1',
          cid: USER_ID,
          an: "Rodeo",
          av: rodeoVersion,
          sr: $(window).width() + "x" + $(window).height(),
          // event
          t: 'event',
          ec: cat,
          ea: action
        }
        if (label) {
          params.el = label;
        }
        if (value) {
          params.ev = value;
        }
        var url = "https://www.google-analytics.com/collect?" + querystring.stringify(params);
        console.log(url);
        console.log(JSON.stringify(params));
        post(url);
      }
    });
  }
}

module.exports.track = track;
