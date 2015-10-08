var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var getmac = require('getmac');
var uuid = require('uuid');
var ipc = require('ipc');
var rodeohelpers = require(__dirname + "/../src/rodeohelpers");

global.USER_ID;

function getUserId(fn) {
  if (global.USER_ID!=null) {
    fn(null, global.USER_ID);
    return
  }
  // get id for user
  var userId;
  // check .rodeorc for rodeoid
  var rc = rodeohelpers.getRC();
  if (rc.id) {
    userId = rc.id;
    fn(null, userId);
  } else {
    getmac.getMac(function(err, macAddress) {
      if (err) {
        userId = uuid.v4().toString();
      } else {
        userId = require("crypto").createHash('sha1').update(macAddress, 'utf8').digest('hex');
      }
      rodeohelpers.updateRC("id", userId);
      fn(null, userId);
    });
  }
}

var rodeoVersion = require('../package.json').version;
function track(category, action, label, value) {
  var data = {
    an: "Rodeo",          // app name
    av: rodeoVersion,     // app version
    cid: USER_ID,         // user id
    ec: category,         // event category
    ea: action,           // event action
    el: label             // event label
  }

  var url = "http://rodeo-analytics.yhathq.com/?" + querystring.stringify(data);
  if (navigator.onLine==true) {
    http.get(url);
  }
}

global.USER_ID = null;
getUserId(function(err, userId) {
  global.USER_ID = userId;
});

module.exports.getUserId = getUserId;
module.exports.track = track;
