function restartSession() {
  sendCommand("%reset -f");
  refreshVariables();
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
  pickDirectory('Select a Working Directory', store.get('userWorkingDirectory'), function (wd) {
    if (! wd) {
      return;
    }

    // todo:  what??
    var wd = wd[0];

    ipc.send('wd-post', wd);
    setFiles(wd).then(function (data) {
      console.log('setWorkingDirectory', data);
    }).catch(function (error) {
      console.error('setWorkingDirectory', error);
    });

    if (fn) {
      fn(wd);
    }
  });
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

function logout() {
  window.location.href = "/logout";
}
