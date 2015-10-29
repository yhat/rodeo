// things that run last
//
// start the console
startPrompt();

setupMenu();

getWorkingDirectory(function(wd) {
  setFiles(wd);
});

setupPreferences();

// misc startup stuff...
$("#tour").owlCarousel({ singleItem: true });
$('[data-toggle="tooltip"]').tooltip();
setTimeout(calibratePanes, 450);
setupWindows();
initShortcutsDisplay();
