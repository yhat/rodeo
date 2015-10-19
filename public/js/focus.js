
function focusOnEditor() {
  var id = $("#editors .active .editor").attr("id");
  var editor = ace.edit(id);
  editor.focus();
}

function focusOnConsole() {
  jqconsole.Focus();
}

function focusOnTopRight() {
  var next = $("#top-right .nav .active").next();
  if (! $(next).length) {
    next = $("#top-right .nav li").first();
  }
  $("a", next).click()
}

function focusOnBottomRight() {
  var next = $("#bottom-right .nav .active").next();
  if (! $(next).length) {
    next = $("#bottom-right .nav li").first();
  }
  $("a", next).click()
}
