var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var os = require('os');
var http = require('http');
var querystring = require('querystring');
var ipc = require('ipc');
var metrics = require('./metrics');
var helpers = require('./rodeohelpers');


global.USER_ID = null;
metrics.getUserId(function(err, userId) {
  global.USER_ID = userId;
});

function sendMetric(category, action, label, value) {
  var data = {
    an: "Rodeo",          // app name
    av: app.getVersion(), // app version
    cid: USER_ID,         // user id
    ec: category,         // event category
    ea: action,           // event action
    el: label             // event label
  }

  var url = "http://rodeo-analytics.yhathq.com/?" + querystring.stringify(data);
  try {
    http.get(url);
  } catch (e) {
    // do nothing
  }
}

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  //   app.quit();
  // }
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  // Create the browser window.
  var atomScreen = require('screen');
  var size = atomScreen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({ width: size.width, height: size.height });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/../static/index.html');

  mainWindow.webContents.on('did-finish-load', function() {
    console.log("[INFO]: " + JSON.stringify(process.argv));
    var wd = null; // process.argv[1];
    if (wd) {
      console.log("[INFO]: working directory passed as argument: `" + wd + "`");
      mainWindow.webContents.send('set-wd', wd);
    }
    var rc = helpers.getRC();
    if (rc.version==null) {
      mainWindow.webContents.send('start-tour', { version: "first" });
      helpers.updateRC("version", app.getVersion());
    } else if (rc.version != app.getVersion()) {
      mainWindow.webContents.send('start-tour', { version: app.getVersion() });
      helpers.updateRC("version", app.getVersion());
    }
  });

  // Open the devtools.
  // mainWindow.openDevTools();

  var internetStatus = 'online';
  ipc.on('online-status-changed', function(evt, status) {
    internetStatus = status;
  });

  ipc.on('metric', function(event, data) {
    if (! /rodeo-native/.test(app.getAppPath())) {
      if (internetStatus=='online') {
        sendMetric(data.cat, data.action, data.label, data.value);
      }
    } else {
      // we're in dev mode
      console.info('[INFO]: theoretically tracking metrics: ' + JSON.stringify(data));
    }
  });

  ipc.on('quit', function(event) {
    app.quit();
  });

  // TODO: check for updates (i think i need to codesign?)
  // var autoUpdater = require('auto-updater');
  // var platform = os.platform() + '_' + os.arch();
  // var version = app.getVersion();
  // var updateUrl = 'https://rodeo-nuts.herokuapp.com/update/' + 'osx_64' + '/' + version;
  // autoUpdater.setFeedUrl(updateUrl);

  mainWindow.on('close', function() {
    mainWindow.webContents.send('kill');
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
