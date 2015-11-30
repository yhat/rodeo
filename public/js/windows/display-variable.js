var variableWindow;
function showVariable(varname, type) {
  var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };

  var BrowserWindow = remote.require('browser-window');
  variableWindow = new BrowserWindow(params);
  variableWindow.loadURL('file://' + __dirname + '/../static/display-variable.html');
  // variableWindow.openDevTools();

  var show_var_statements = {
    DataFrame: "print(" + varname + "[:1000].to_html())",
    Series: "print(" + varname + "[:1000].to_frame().to_html())",
    list: "pp.pprint(" + varname + ")",
    ndarray: "pp.pprint(" + varname + ")",
    dict: "pp.pprint(" + varname + ")",
    other: "pp.pprint(" + varname + ")"
  }

  variableWindow.webContents.on('dom-ready', function() {
    var showVar = show_var_statements[type];
    if (! showVar) {
      showVar = show_var_statements.other;
    }
    executeCommand(showVar, false, function(result) {
      variableWindow.webContents.send('ping', { type: type, html: result.output });
    });
  });

  variableWindow.on('close', function() {
    variableWindow = null;
  });
}
