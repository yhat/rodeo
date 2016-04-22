function fileIndexStart() {
  $("#file-search-list .list").children().remove();
  $("#file-search-list .list").append("<li id='index-count'><i class='fa fa-hourglass-end'></i>&nbsp;Indexing files</li>");
}

function indexFile(data) {
  var fileSearchItem = file_search_item_template(data);
  $("#file-search-list .list").append(fileSearchItem);
}

function fileIndexUpdate(data) {
  var html = "<i class='fa fa-hourglass-end'></i>&nbsp;Indexing files " + data.nComplete;
  $("#file-search-list .list #index-count").html(html);
}

function fileIndexInterrupt() {
  $("#file-search-list .list").children().remove();
  var msg = "Sorry this directory was too big to index."
  $("#file-search-list .list").append("<li id='index-count'><i class='fa fa-ban'></i>&nbsp;" + msg + "</li>");
}

function fileIndexComplete() {
  // remove the 'indexing...' and make the files visible
  $("#file-search-list #index-count").remove();
  $("#file-search-list .list .hide").removeClass("hide");
  // update the UI
  indexFiles();
}

var fileList;
function indexFiles() {
  $("#file-search-list .list li").removeClass("selected");
  $("#file-search-list .list li").first().addClass("selected");
  var options = { valueNames: [ 'filename' ] };
  fileList = new List('file-search-list', options);
  $("#file-search-form").unbind();
  $("#file-search-form").submit(function(e) {
    e.preventDefault();
    var filename = $("#file-search-list .selected").attr("data-filename");
    openFile(filename);
    $("#file-search-input").val("");
    $("#file-search-modal").modal("hide");
    $("#file-search-list .list li").removeClass("selected");
    return false;
  });
}

function refreshVariables() {
  executeCommand("__get_variables(globals())", false, function(result) {
    if (! result.output) {
      $("#vars").children().remove();
      console.error("[ERROR]: Result from code execution was null.");
      return;
    }
    var variables = JSON.parse(result.output);
    $("#vars").children().remove();
    var variableTypes = ["list", "dict", "ndarray", "DataFrame", "Series", "function", "other"];
    variableTypes.forEach(function(type) {
      var isOnDesktop = isDesktop();
      variables[type].forEach(function(v) {
        $("#vars").append(active_variables_row_template({
            name: v.name, type: type, repr: v.repr, isDesktop: isOnDesktop
          })
        );
      }.bind(this));
    });
    // configure column widths
    $("#vars tr").first().children().each(function(i, el) {
      $($("#vars-header th")[i]).css("width", $(el).css("width"));
    });
  });
}

function refreshPackages() {
  executeCommand("__get_packages()", false, function(result) {
    var packages = JSON.parse(result.output);
    $("#packages-rows").children().remove();
    packages.forEach(function(p) {
      $("#packages-rows").append(
        package_row_template({ name: p.name, version: p.version})
      );
    });
  });
}

function findFile() {
  $("#file-search-modal").unbind();
  $("#file-search-modal").modal("show");
  $("#file-search-modal input").focus();
  $("#file-search-modal").keydown(function(e){
    var selectedFile = $("#file-search-list .list .selected").data("filename");
    if (! fileList) {
      return;
    }
    var nextFile;
    if (e.which==40) {
      // down
      for(var i=0; i<fileList.matchingItems.length-1; i++) {
        if ($(fileList.matchingItems[i].elm).data("filename")==selectedFile) {
          nextFile = $(fileList.matchingItems[i+1].elm).data("filename");
          break;
        }
      }
      if (! nextFile) {
        nextFile = $(fileList.matchingItems[0].elm).data("filename");
      }
    } else if (e.which==38) {
      // up
      for(var i=fileList.matchingItems.length-1; i>0; i--) {
        if ($(fileList.matchingItems[i].elm).data("filename")==selectedFile) {
          nextFile = $(fileList.matchingItems[i-1].elm).data("filename");
          break;
        }
      }
      if (! nextFile) {
        nextFile = $(fileList.matchingItems[fileList.matchingItems.length-1].elm).data("filename");
      }
    }

    $("#file-search-list .list li").each(function(i, el) {
      if ($(el).data("filename")==nextFile) {
        $("#file-search-list .list .selected").removeClass("selected");
        $(el).addClass("selected");
        // keep selected item in the center
        var $parentDiv = $("#file-search-list ul");
        var $innerListItem = $(el);
        $parentDiv.scrollTop($parentDiv.scrollTop() + $innerListItem.position().top - $parentDiv.height()/1.5 + $innerListItem.height()/3);
      }
    });
  });
}


function setDefaultPreferences(editor) {
  getRC(function(rc) {
    if (rc.keyBindings=="default") {
      rc.keyBindings = null;
    }
    editor.setKeyboardHandler(rc.keyBindings || null); // null is the "default"
    editor.setTheme(rc.editorTheme || "ace/theme/chrome");
    editor.setFontSize(rc.fontSize || 12);
    if (rc.fontType) {
      // TODO: not all fonts are available
      // editor.setOption("fontFamily", rc.fontType);
    }

    if (rc.autoSave) {
      editor.on('input', function() {
        saveEditor();
      });
    }
  });
}

function saveActiveEditor(saveas) {
  saveas = saveas || false
  var editor = getActiveEditor();
  saveEditor(editor, saveas);
}

function closeActiveFile() {
  if ($("#editorsTab .active").length) {
    var n = $("#editorsTab .active").attr("id").replace("editor-tab-", "");
    closeActiveTab(n);
  }
}

function shiftEditorLeft() {
  var prevTab = $("#editorsTab .active").prev();
  if (prevTab && $("a", prevTab).attr("href")!="#") {
    $("a", prevTab).click();
  } else {
    prevTab = $("#editorsTab li").last().prev();
    $("a", prevTab).click()
  }
  var id = $(prevTab).attr("id").replace("tab-", "");
  ace.edit(id).focus();
}

function shiftEditorRight() {
  var nextTab = $("#editorsTab .active").next();
  if (nextTab && $("a", nextTab).attr("href")!="#") {
    $("a", nextTab).click();
  } else {
    nextTab = $("#editorsTab li").first().next();
    $("a", nextTab).click();
  }
  var id = $(nextTab).attr("id").replace("tab-", "");
  ace.edit(id).focus();
}

function getActiveEditor() {
  var id = $("#editors .active .editor").attr("id");
  return ace.edit(id);
}

function saveFile(filepath, content, fn) {
  var payload = { "filepath": filepath, "content": content };
  if (isDesktop()) {
    var data = ipc.send('file-post', payload);
    fn(data);
  } else {
    $.post('file', payload, function(resp) {
      fn(resp);
    });
  }
}


function closeActiveTab(n) {
  if (! $("#editor-tab-" + n + " .unsaved").hasClass("hide")) {
    bootbox.dialog({
      title: "Do you want to save the changes you've made to this file?",
      message: "Your changes will be discarded otherwise.",
      buttons: {
        cancel: {
          label: "Cancel",
          className: "btn-default",
          callback: function() {
            return;
          }
        },
        dontSave: {
          label: "Don't Save",
          className: "btn-default",
            callback: function() {
              $("#editorsTab .editor-tab-a").first().click();
              $("#editor-tab-" + n).remove();
              $("#editor-tab-pane-" + n).remove();
            }
        },
        save: {
          label: "Save",
          className: "btn-primary",
          callback: function() {
            saveEditor(ace.edit("editor-" + n), null, function() {
              $("#editorsTab .editor-tab-a").first().click();
              $("#editor-tab-" + n).remove();
              $("#editor-tab-pane-" + n).remove();
            });
          }
        }
      }
    });
  } else {
    var prevTab = $("#editor-tab-" + n).prev();
    $("#editor-tab-" + n).remove();
    $("#editor-tab-pane-" + n).remove();
    if (prevTab && $("a", prevTab).attr("href")!="#") {
      $("a", prevTab).click();
    }
  }
}

function newEditor(basename, fullpath, content) {
  var editor = addEditor();
  $("#editorsTab li:nth-last-child(2) .name").text(basename);
  $("#editorsTab li:nth-last-child(2) a").attr("data-filename", fullpath);
  editor.getSession().setValue(content);
  return editor;
}

function openFile(pathname, isDir) {
  // if file is already open, then just switch to it
  if ($("#editorsTab a[data-filename='" + pathname + "']").length) {
    $("#editorsTab a[data-filename='" + pathname + "']").click();
    return;
  } else if (isDir) {
    var directory = pathname;
    setFiles(pathname);
  } else {
    function callback(basename, pathname, content) {
      var editor = newEditor(basename, pathname, content)
      // [+] tab is always the last tab, so we'll activate the 2nd to last tab
      $("#editorsTab li:nth-last-child(2) a").click();
      var id = $("#editors .editor").last().attr("id");
      // set to not modified -- NOT IDEAL but it works :)
      setTimeout(function() {
        $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
      }, 50);
    }
    if (isDesktop()) {
      var data = ipc.send('file-get', pathname);
      callback(data.basename, pathname, data.content);
    } else {
      $.get("file", { filepath: pathname }, function(resp) {
        callback(resp.basename, pathname, resp.content);
      });
    }
  }
}

function saveEditor(editor, saveas, fn) {
  saveas = saveas || false;
  var id = $($("#editorsTab .active a").attr("href") + " .editor").attr("id");
  if (! editor) {
    editor = ace.edit(id);
  }

  var filename = $("#editorsTab .active a").text();
  var content = editor.getSession().getValue();
  if (! $("#editorsTab .active a").attr("data-filename") || saveas==true) {
    if (isDesktop()) {
      remote.require('dialog').showSaveDialog({
        title: 'Save File',
        default_path: ipc.send('wd-get'),
      }, function(destfile) {
        if (! destfile) {
          return
        }
        // if there's no file extension specified, we'll assume they meant a python file
        if (! /\.[A-Za-z0-9]{1,5}$/.test(destfile)) {
          destfile = destfile + ".py";
        }
        var basename = pathBasename(destfile);
        $("#editorsTab .active a .name").text(basename);
        $("#editorsTab .active a").attr("data-filename", destfile);
        saveFile(destfile, content, function(resp) {
          $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
          setFiles();
          if (fn) {
            fn();
          }
        });
      });
    } else {
      bootbox.prompt("Please specify a name for your file:", function(destfile) {
        if (destfile==null) {
          return;
        }
        var basename = pathBasename(destfile);
        $("#editorsTab .active a .name").text(basename);
        $("#editorsTab .active a").attr("data-filename", destfile);
        saveFile(destfile, content, function(resp) {
          $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
          setFiles();
          if (fn) {
            fn();
          }
        });
      });
    }
  } else {
    saveFile($("#editorsTab .active a").attr("data-filename"), content, function(resp) {
      $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
      setFiles();
      if (fn) {
        fn();
      }
    });
  }
}

function openDialog() {
  require('remote').dialog.showOpenDialog({
    title: "Select a file to open",
    defaultPath: require("electron").ipcRenderer.send("wd-get"),
    properties: ["openFile"]
  }, function(filenames) {
    if (filenames && filenames.length > 0) {
      openFile(filenames[0]);
    }
  });
}
