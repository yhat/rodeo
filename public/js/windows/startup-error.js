function showError(err) {
  if (/matplotlib/.test(err)) {
    $("#matplotlib-error").removeClass("hide");
  } else {
    $("#ipython-error").removeClass("hide");
  }
  $("#loading-modal").modal('hide');
  $("#error-modal").modal({ backdrop: 'static', keyboard: false, show: true });
  if (/win32/i.test(navigator.platform)) {
    $("#error-modal pre").text('c:\\> for %i in (python.exe) do @echo. %~$PATH:i');
  }
}

// $("#error-modal .modal-body").append(bad_python_template());

$("#btn-set-path").click(function(e) {
  var newPath = $("#python-path").val();
  if (newPath) {
    $("#loading-gif").attr("src", "img/loading.gif");
    var data = ipc.sendSync('test-path', newPath);

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
          $("#which-python").addClass("hide");
          ipc.sendSync('launch-kernel', newPath);
          $("#rodeo-ready").removeClass("hide");
          setTimeout(function() {
            $("#error-modal").modal('hide');
          }, 3000);
        } else if (data.result.jupyter==false) {
          $("#which-python").addClass("hide");
          $("#install-jupyter").removeClass("hide");
        } else if (data.result.matplotlib==false) {
          $("#which-python").addClass("hide");
          $("#install-matplotlib").removeClass("hide");
        }
      }
    }, 1250+400);
  }
});
