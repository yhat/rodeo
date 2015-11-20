var errorWindow;

function showError(err) {
  var params = {toolbar: false, resizable: false, show: true, height: 650, width: 800};
  var BrowserWindow = remote.require('browser-window');
  errorWindow = new BrowserWindow(params);
  errorWindow.loadURL('file://' + __dirname + '/../static/bad-python.html');
  errorWindow.webContents.on('dom-ready', function() {
    errorWindow.webContents.send('ping', { error: err });
  });
  // errorWindow.openDevTools();
}
