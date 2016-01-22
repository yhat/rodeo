function showError(err) {
return;



  var params = { toolbar: false, resizable: false, show: true, height: 800, width: 800, alwaysOnTop: true };
  var BrowserWindow = remote.require('browser-window');
  errorWindow = new BrowserWindow(params);
  errorWindow.loadURL('file://' + __dirname + '/../static/setup-error.html');
  errorWindow.openDevTools();
  errorWindow.webContents.on('did-finish-load', function() {
    errorWindow.webContents.send('startup-error', err);
  });

  return;

  $("#loading-modal").modal('hide');
  // $("#error-modal .possible-error").addClass("hide");

  console.log("[ERROR]: ", err);

  if (/python path/.test(err)) {
    $("#good-to-go").addClass("hide");
    $("#install-jupyter").addClass("hide");
    $("#python-path-missing").removeClass("hide");

    $("#output-python").removeClass("hide")
                        .removeClass("list-group-item-success")
                        .addClass("list-group-item-danger");
    $("#output-python i").removeClass("fa-check").addClass("fa-times");

    $("#output-jupyter").removeClass("hide")
                        .removeClass("list-group-item-success")
                        .addClass("list-group-item-danger");
    $("#output-jupyter i").removeClass("fa-check").addClass("fa-times");
  } else if (/jupyter/.test(err)) {
    $("#good-to-go").addClass("hide");
    $("#install-jupyter").removeClass("hide");
    $("#python-path-missing").addClass("hide");

    $("#output-python").removeClass("hide")
                        .removeClass("list-group-item-danger")
                        .addClass("list-group-item-success");
    $("#output-python i").removeClass("fa-times").addClass("fa-check");

    $("#output-jupyter").removeClass("hide")
                        .removeClass("list-group-item-success")
                        .addClass("list-group-item-danger");
    $("#output-jupyter i").removeClass("fa-check").addClass("fa-times");
  } else {
    $("#good-to-go").removeClass("hide");
    $("#install-jupyter").addClass("hide");
    $("#python-path-missing").addClass("hide");

    $("#output-python").removeClass("hide")
                        .removeClass("list-group-item-danger")
                        .addClass("list-group-item-success");
    $("#output-python i").removeClass("fa-times").addClass("fa-check");

    $("#output-jupyter").removeClass("hide")
                        .removeClass("list-group-item-danger")
                        .addClass("list-group-item-success");
    $("#output-jupyter i").removeClass("fa-times").addClass("fa-check");
    // setTimeout(function() {
    //   $("#error-modal").modal('hide');
    // }, 1500);
  }

  $("#error-modal").modal({ backdrop: 'static', keyboard: false, show: true });
  if (/win32/i.test(navigator.platform)) {
    $("#which-python pre").text('c:\\> for %i in (python.exe) do @echo. %~$PATH:i');
    $("#error-modal a").attr("onClick", "shell.openItem('cmd.exe');")
  }
}

function pickPython() {
  require('remote').dialog.showOpenDialog({
    title: "Select your Python",
    properties: [ 'openFile' ]
  }, function(pythonPath) {
    $("#python-path").val(pythonPath);
  });
}

function testPath(path) {
  $("#error-modal .possible-error").addClass("hide");
  var data = ipc.sendSync('test-path', path);

  // dramatically unveil the results
  $("#output-jupyter").css("opacity", 0);
  $("#output-python").css("opacity", 0).animate({ opacity: 1, duration: 250 });
  setTimeout(function() {
    $("#output-jupyter").animate({ opacity: 1 });
  }, 750);

  setTimeout(function() {
    if (data.result.status && data.result) {
      if (data.result.jupyter) {
        ipc.sendSync('launch-kernel', path);
        $("#rodeo-ready").removeClass("hide");
        $("#test-results").children().remove();
        setTimeout(function() {
          $("#error-modal").modal('hide');
        }, 3000);
      } else if (data.result.jupyter==false) {
        $("#install-jupyter").removeClass("hide");
      }
    }
  }, 1250+400);
}

$("#btn-set-path").click(function(e) {
  var newPath = $("#python-path").val();
  if (newPath) {
    testPath(newPath);
  }
});
