var app = require('app');
var autoUpdater = require('auto-updater');
var BrowserWindow = require('browser-window');
var os = require('os');
var http = require('http');
var querystring = require('querystring');
var ipc = require('ipc');
var helpers = require('./rodeohelpers');


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
    mainWindow.webContents.send('log', JSON.stringify(process.argv))
    var wd;
    if (process.argv.length == 5) {
      wd = process.argv[4];
    }
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

  ipc.on('quit', function(event) {
    app.quit();
  });

  // TODO: check for updates (i think i need to codesign?)
  var platform = os.platform() + '_' + os.arch();
  var version = app.getVersion();
  updateUrl = 'https://rodeo-nuts.herokuapp.com/update/'+platform+'/'+version;

  autoUpdater.on('error', function(err, msg) {
    mainWindow.webContents.send('log', "[ERROR]: " + msg);
  });
  mainWindow.webContents.send('log', updateUrl);
  autoUpdater.setFeedUrl(updateUrl);

  autoUpdater.on('update-available', function(data) {
    mainWindow.webContents.send('log', "UPDATE AVAILABLE");
    mainWindow.webContents.send('log', data);
  });
  autoUpdater.on('update-not-available', function(data) {
    mainWindow.webContents.send('log', "NO UPDATE AVAILABLE");
    mainWindow.webContents.send('log', data);
  });

  autoUpdater.checkForUpdates();

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
