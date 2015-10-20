function showVariable(varname, type) {

  window.location.href = '/variable?name=' + varname + '&type=' + type;
  
  // var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };
  //
  // variableWindow = new BrowserWindow(params);
  // variableWindow.loadUrl('file://' + __dirname + '/../static/display-variable.html');
  // // variableWindow.openDevTools();
  //
  // var show_var_statements = {
  //   DataFrame: "print(" + varname + "[:1000].to_html())",
  //   Series: "print(" + varname + "[:1000].to_frame().to_html())",
  //   list: "pp.pprint(" + varname + ")",
  //   ndarray: "pp.pprint(" + varname + ")",
  //   dict: "pp.pprint(" + varname + ")"
  // }
  // variableWindow.webContents.on('did-finish-load', function() {
  //   python.execute(show_var_statements[type], false, function(result) {
  //     variableWindow.webContents.send('ping', { type: type, html: result.output });
  //   });
  // });
  //
  // variableWindow.on('close', function() {
  //   variableWindow = null;
  // });

}
