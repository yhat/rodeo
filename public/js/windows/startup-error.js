function showError(err) {
  $("#test-results").children().remove();
  $("#loading-modal").modal('hide');
  $("#error-modal .possible-error").addClass("hide");

  console.log(err);

  if (/python path/.test(err)) {
    $("#python-path-missing").removeClass("hide");
  } else if (/matplotlib/.test(err)) {
    $("#install-matplotlib").removeClass("hide");
  } else if (/jupyter/.test(err)) {
    $("#install-jupyter").removeClass("hide");
  }

  $("#error-modal").modal({ backdrop: 'static', keyboard: false, show: true });
  if (/win32/i.test(navigator.platform)) {
    $("#which-python pre").text('c:\\> for %i in (python.exe) do @echo. %~$PATH:i');
    $("#error-modal a").attr("onClick", "shell.openItem('cmd.exe');")
  }
}

function testPath(path) {
  $("#loading-gif").attr("src", "img/loading.gif");
  $("#error-modal .possible-error").addClass("hide");
  var data = ipc.sendSync('test-path', path);

  $("#loading-gif").addClass("hide");
  var results = python_test_output_template(data.result);
  $("#test-results").children().remove();
  $("#test-results").append(results);

  // dramatically unveil the results
  $("#output-matplotlib").css("opacity", 0);
  $("#output-jupyter").css("opacity", 0);
  $("#output-python").css("opacity", 0).animate({ opacity: 1, duration: 250 });
  setTimeout(function() {
    $("#output-jupyter").animate({ opacity: 1 });
  }, 750);
  setTimeout(function() {
    $("#output-matplotlib").animate({ opacity: 1 });
  }, 1250);

  setTimeout(function() {
    if (data.result.status && data.result) {
      if (data.result.matplotlib && data.result.jupyter) {
        ipc.sendSync('launch-kernel', path);
        $("#rodeo-ready").removeClass("hide");
        $("#test-results").children().remove();
        setTimeout(function() {
          $("#error-modal").modal('hide');
        }, 3000);
      } else if (data.result.jupyter==false) {
        $("#install-jupyter").removeClass("hide");
      } else if (data.result.matplotlib==false) {
        $("#install-matplotlib").removeClass("hide");
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
