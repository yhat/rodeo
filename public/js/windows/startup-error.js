function showError(err) {
  if (/matplotlib/.test(err)) {
    $("#matplotlib-error").removeClass("hide");
  } else {
    $("#ipython-error").removeClass("hide");
  }
  $("#error-modal").modal('show');
}

$("#error-modal .modal-body").append(bad_python_template());