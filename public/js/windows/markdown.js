var markdownWindow;
function renderMarkdown(html) {
  var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };

  var BrowserWindow = remote.require('browser-window');
  markdownWindow = new BrowserWindow(params);

  // I'm not proud of this, but we need the file to be in the same relative directory
  // as our css, js, etc.
  markdownWindow.loadURL('file://' + __dirname + '/../static/markdown-desktop.html');
  markdownWindow.webContents.on('dom-ready', function() {
    markdownWindow.webContents.send('content', { html: html });
  });

  ipc.on('pdf', function(destfile) {
    markdownWindow.webContents.printToPDF({}, function(err, data) {
      require('fs').writeFile(destfile, data, function(error) {
        if (err) {
          throw error;
        }
      });
    });
  });
  // markdownWindow.openDevTools();
}
