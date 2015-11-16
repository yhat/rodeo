var markdownWindow;
function renderMarkdown(html) {
  var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };

  var BrowserWindow = remote.require('browser-window');
  markdownWindow = new BrowserWindow(params);

  // I'm not proud of this, but we need the file to be in the same relative directory
  // as our css, js, etc.
  var tmpFile = __dirname + '/../static/markdown-desktop.html';
  require('fs').writeFileSync(tmpFile, html);
  markdownWindow.loadURL('file://' + tmpFile)
  // markdownWindow.openDevTools();
}
