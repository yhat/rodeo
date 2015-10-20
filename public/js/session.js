
function restartSession() {
  sendCommand("%reset -f");
  refreshVariables();
}

function getWorkingDirectory(fn) {
  if (isDesktop()) {
    var wd = ipc.sendSync('wd-get');
    fn(wd);
  } else {
    $.get("wd", function(currentWd) {
      fn(currentWd);
    });
  }
}

function pickDirectory(title, defaultPath, fn) {
  remote.require('dialog').showOpenDialog({
    title: title,
    properties: ['openDirectory'],
    defaultPath: defaultPath
  }, function(dir) {
    fn(dir);
  });
}

function setWorkingDirectory(fn) {
  if (isDesktop()) {
    pickDirectory('Select a Working Directory', USER_WD, function(wd) {
      if (! wd) {
        return;
      }
      var wd = wd[0];
      ipc.sendSync('wd-post', wd);
      setFiles(wd);
      if (fn) {
        fn(wd);
      }
    });
  } else {
    $.get("wd", function(currentWd) {
      bootbox.prompt({
        title: "Please specify a working directory:",
        value: currentWd,
        callback: function(wd) {
          if (wd==null) {
            return;
          }
          $.post("wd", { "wd": wd }, function(resp) {
            if (resp.status=="error") {
              return;
            } else {
              $("#defaultWorkingDirectory").val(wd);
              if (fn) {
                fn(wd);
              }
            }
          });
        }
      });
    });
  }
}

function runLastCommand() {
  var cmd = $("#history-trail").children().slice(-1).text().trimLeft();
  jqconsole.ClearPromptText();
  jqconsole.Write(jqconsole.GetPromptText(true) + cmd + '\n');
  jqconsole.ClearPromptText();
  sendCommand(cmd);
}

function run2ndToLastCommand() {
  var cmd = $("#history-trail").children().slice(-2, -1).text().trimLeft();
  jqconsole.ClearPromptText();
  jqconsole.Write(jqconsole.GetPromptText(true) + cmd + '\n');
  jqconsole.ClearPromptText();
  sendCommand(cmd);
}
