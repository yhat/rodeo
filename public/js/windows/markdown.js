var markdownWindow;
function renderMarkdown(html) {
  var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };

  var BrowserWindow = remote.require('browser-window');
  markdownWindow = new BrowserWindow(params);
  markdownWindow.loadUrl('file://' + __dirname + '/../static/markdown.html');
  markdownWindow.openDevTools();
  console.log("HI");

  setTimeout(function() {
    markdownWindow.webContents.send('markdown', { html: html });
  }, 1000);

  markdownWindow.on('close', function() {
    markdownWindow = null;
  });
}
