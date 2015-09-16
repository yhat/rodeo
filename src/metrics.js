var fs = require('fs');
var uuid = require('uuid');
var querystring = require('querystring');
var rodeohelpers = require(__dirname + "/../src/rodeohelpers");
var rodeoVersion = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString()).version;
var ipc = require('ipc');

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

function send(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.send(null);
}

function track(cat, action, label, value) {
  ipc.send('metric', { cat: cat, action: action, label: label, value: value });
}

var rc = rodeohelpers.getRC();
function send(cat, action, label, value) {
  if (rc.tracking==null || rc.trackingOn==true) {
    return;
    getUserId(function(err, userId) {
      if (global.USER_ID==null) {
        global.USER_ID = userId;
      }
      // if we have internet...
      if (navigator && navigator.onLine) {
        var params = {
          v: 1,
          tid: 'UA-46996803-1',
          cid: USER_ID,
          t: 'event',
          ec: cat,
          ea: action,
          an: "Rodeo",
          av: rodeoVersion,
          sr: $(window).width() + "x" + $(window).height(),
        }
        if (label) {
          params.el = label;
        }
        if (value) {
          params.ev = value;
        }
        var url = "http://rodeo-analytics.yhathq.com/?" + querystring.stringify(params);
        send(url);
      }
    });
  }
}

module.exports.track = track;
module.exports.send = send;
