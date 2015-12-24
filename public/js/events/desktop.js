var ipc = require('ipc');

ipc.on('refresh-variables', function() {
  refreshVariables();
});

ipc.on('refresh-packages', function() {
  refreshPackages();
});

ipc.on('setup-preferences', function() {
  setupPreferences();
});

ipc.on('plot', function(result) {
  addPlot(result);
  $("#btn-interrupt").addClass("hide");
})

ipc.on('set-working-directory', function(wd) {
  setFiles(wd);
});

ipc.on('file-index-start', function() {
  fileIndexStart();
});

ipc.on('index-file', function(data) {
  indexFile(data);
});

ipc.on('file-index-update', function(data) {
  fileIndexUpdate(data);
});

ipc.on('file-index-interrupt', function() {
  fileIndexInterrupt();
});

ipc.on('file-index-complete', function() {
  fileIndexComplete();
});

ipc.on('log', function(data) {
  console.log("[LOG]: " + data.toString());
});

ipc.on('ready', function(data) {
  $("#loading-modal").modal('hide');
});

ipc.on('no-update', function() {
  var body = "Good news! You're running the most up to date version of Rodeo.";
  new Notification("You're up to date", {
    title: "You're up to date", body: body
  });
});

ipc.on('update-ready', function(data) {
  var body;
  if (data.platform=="windows") {
    body = "Click here to download the latest version."
  } else {
    body = "Click here to update";
  }
  var n = new Notification("Update Available", { title: "Update Available", body: body });
  n.onclick = function() {
    if (data.platform=="windows")  {
      require('shell').openExternal('https://www.yhat.com/products/rodeo/downloads');
    } else {
      ipc.send('update-and-restart');
    }
  }
});

ipc.on('startup-error', function(err) {
  showError(err);
});

ipc.send('index-files');
