var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var uuid = require('uuid');
var ipc = require('ipc');
var rodeohelpers = require(__dirname + "/../src/rodeohelpers");
var rodeoVersion = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString()).version;

global.USER_ID;

function getUserId(fn) {
  if (global.USER_ID!=null) {
    fn(null, global.USER_ID);
    return;
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

function sendData(url) {
  http.get(url);
}

function track(cat, action, label, value) {
  var data = { cat: cat, action: action, label: label, value: value };
  ipc.send('metric', data);
}

var rc = rodeohelpers.getRC();
function send(cat, action, label, value) {
  if (rc.trackingOn==null || rc.trackingOn==true) {
    getUserId(function(err, userId) {
      if (global.USER_ID==null) {
        global.USER_ID = userId;
      }
      // if we have internet...
      var params = {
        v: 1,
        tid: 'UA-46996803-1',
        cid: USER_ID,
        t: 'event',
        ec: cat,
        ea: action,
        an: "Rodeo",
        av: rodeoVersion,
        // sr: $(window).width() + "x" + $(window).height(),
      }
      if (label) {
        params.el = label;
      }
      if (value) {
        params.ev = value;
      }
      var url = "http://rodeo-analytics.yhathq.com/?" + querystring.stringify(params);
      sendData(url);
    });
  }
}

module.exports.track = track;
module.exports.send = send;
