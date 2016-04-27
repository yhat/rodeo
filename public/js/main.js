// things that run last
//
// start the console
startPrompt();
setupPreferences();

getWorkingDirectory(function(wd) {
  setFiles(wd);
});

(function () {
  let pythonPaths = store.get('pythonPaths'),
    pythonCmd = store.get('pythonCmd');

  pythonPaths = pythonPaths || [];
  if (pythonCmd && pythonPaths.indexOf(pythonCmd) < 0) {
    pythonPaths.push(pythonCmd);
  }
  pythonPaths.forEach(function (pythonPath) {
    $('#python-paths').append(templates['python-path-item'](pythonPath));
  });
}());

// misc startup stuff...
$('#tour').owlCarousel({ singleItem: true });
$('[data-toggle="tooltip"]').tooltip();
setTimeout(calibratePanes, 650);
setupWindows();
initShortcutsDisplay();
