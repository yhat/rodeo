var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var getmac = require('getmac');
var crypto = require('crypto');
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
        userId = crypto.createHash('sha1').update(macAddress, 'utf8').digest('hex');
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
function track(cat, action, label, value) {
  var data = { cat: cat, action: action, label: label, value: value };
  ipc.send('metric', data);
}

module.exports.track = track;
