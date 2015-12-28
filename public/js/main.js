// things that run last
//
// start the console
startPrompt();

setupMenu();
setupPreferences();

getWorkingDirectory(function(wd) {
  setFiles(wd);
});

getRC(function(rc) {
  rc.pythonPaths = rc.pythonPaths || [];
  if (rc.pythonCmd && rc.pythonPaths.indexOf(rc.pythonCmd) < 0) {
    rc.pythonPaths.push(rc.pythonCmd);
  }
  rc.pythonPaths.forEach(function(pythonPath) {
    $("#python-paths").append(python_path_item(pythonPath))
  });
});

// misc startup stuff...
$("#tour").owlCarousel({ singleItem: true });
$('[data-toggle="tooltip"]').tooltip();
setTimeout(calibratePanes, 450);
setupWindows();
initShortcutsDisplay();
