var aboutWindow;

function showAbout() {
  var params = {toolbar: false, resizable: false, show: true, height: 500, width: 400 };
  var BrowserWindow = remote.require('browser-window');
  aboutWindow = new BrowserWindow(params);
  aboutWindow.loadUrl('file://' + __dirname + '/../static/about.html');
  aboutWindow.openDevTools();
}
