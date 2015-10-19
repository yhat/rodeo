
function restartSession() {
  sendCommand("%reset -f", false);
  refreshVariables();
}

function setWorkingDirectory() {
  $.get("/wd", function(currentWd) {
    bootbox.prompt({
      title: "Please specify a working directory:",
      value: currentWd,
      callback: function(wd) {
        if (wd==null) {
          return;
        }
        $.post("/wd", { "wd": wd }, function(resp) {
          if (resp.status=="error") {
            return;
          } else {
            $("#defaultWorkingDirectory").val(wd);
          }
        });
      }
    });
  });
}

function runLastCommand() {
  sendCommand($("#history-trail").children().slice(-1).text());
}

function run2ndToLastCommand() {
  sendCommand($("#history-trail").children().slice(-2, -1).text());
}
