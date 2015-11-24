// things that run last
//
// start the console
startPrompt();

setupMenu();
setupPreferences();

getWorkingDirectory(function(wd) {
  setFiles(wd);
});

// misc startup stuff...
$("#tour").owlCarousel({ singleItem: true });
$('[data-toggle="tooltip"]').tooltip();
setTimeout(calibratePanes, 450);
setupWindows();
initShortcutsDisplay();
