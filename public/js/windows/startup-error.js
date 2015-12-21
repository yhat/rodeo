function showError(err) {
  if (/matplotlib/.test(err)) {
    $("#matplotlib-error").removeClass("hide");
  } else {
    $("#ipython-error").removeClass("hide");
  }
  $("#loading-modal").modal('hide');
  $("#error-modal").modal('show');
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

    if (data.status && data.results) {
      if (data.results.matplotlib && data.results.jupyter) {
        ipc.sendSync('launch-kernel', newPath);
      }
    }
  }
});
