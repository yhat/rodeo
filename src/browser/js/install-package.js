$("#package-install-button").click(function(e) {
  $("#package-install-modal").modal('show');
  $("#package-install-modal input").focus();
});

$("#package-install-modal form").submit(function(e) {
  e.preventDefault();
  var installer = $("[name='installerRadio']:checked").val();
  var pkgname = $("#package-to-install").val();
  var command;
  if (installer=="pip") {
    command = "__pip_install('" + pkgname + "')";
  } else {
    command = "! conda install -y " + pkgname;
  }

  jqconsole.ClearPromptText();
  jqconsole.Write(">>> " + command + '\n', 'jqconsole-old-input');
  jqconsole.SetHistory(jqconsole.GetHistory().concat([command]));
  sendCommand(command);
  return false;
});
