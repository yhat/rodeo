var wsUrl = document.URL.replace(/https?:\/\//, "ws://");
var ws = new WebSocket(wsUrl);

ws.onopen = function() {
  ws.send(JSON.stringify({ msg: 'index-files'}));
}

ws.onmessage = function(evt) {
  var data = JSON.parse(evt.data);

  if (data.msg=="refresh-variables") {
    refreshVariables();
  } else if (data.msg=="refresh-packages") {
    refreshPackages();
  } else if (data.msg=="set-working-directory") {
    setFiles(data.wd);
  } else if (data.msg=="file-index-start") {
    $("#file-search-list .list").children().remove();
    $("#file-search-list .list").append("<li id='index-count'><i class='fa fa-hourglass-end'></i>&nbsp;Indexing files</li>");
  } else if (data.msg=="index-file") {
    var fileSearchItem = file_search_item_template(data);
    $("#file-search-list .list").append(fileSearchItem);
  } else if (data.msg=="file-index-update") {
    var html = "<i class='fa fa-hourglass-end'></i>&nbsp;Indexing files " + data.n;
    $("#file-search-list .list #index-count").html(html);
  } else if (data.msg=="file-index-interrupt") {
    $("#file-search-list .list").children().remove();
    var msg = "Sorry this directory was too big to index."
    $("#file-search-list .list").append("<li id='index-count'><i class='fa fa-ban'></i>&nbsp;" + msg + "</li>");
  } else if (data.msg=="file-index-complete") {
    // remove the 'indexing...' and make the files visible
    $("#file-search-list #index-count").remove();
    $("#file-search-list .list .hide").removeClass("hide");
    // update the UI
    indexFiles();
  } else {
    console.log("UNKNOWN MESSAGE");
  }
};

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
  executeCommand("__get_variables()", false, function(result) {
    if (! result.output) {
      $("#vars").children().remove();
      console.error("[ERROR]: Result from code execution was null.");
      return;
    }
    var variables = JSON.parse(result.output);
    $("#vars").children().remove();
    var variableTypes = ["list", "dict", "ndarray", "DataFrame", "Series"];
    variableTypes.forEach(function(type) {
      variables[type].forEach(function(v) {
        $("#vars").append(active_variables_row_template({
            name: v.name, type: type, repr: v.repr
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
