function addEditor() {
  var id;
  if ($("#editors .editor").length) {
    id = parseInt($("#editors .editor").last().attr("id").split("-")[1]) + 1;
  } else {
    id = 1;
  }

  var editor_tab_html = editor_tab_template({ n: id, name: "Untitled-" + id + ".py", isFirst: id==0});
  var editor_html = editor_template({ n: id });

  $(editor_tab_html).insertBefore($("#add-tab").parent());
  $("#editors").append(editor_html);
  // set to the active tab
  $("#editor-tab-" + id + " .editor-tab-a").click();
  var editor = ace.edit("editor-" + id);
  editor = configureEditor(editor);
  editor.focus();
  return editor;
}
