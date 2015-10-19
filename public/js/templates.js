
Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

  var operators, result;

  if (arguments.length < 3) {
      throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
  }

  if (options === undefined) {
      options = rvalue;
      rvalue = operator;
      operator = "===";
  }

  operators = {
      '==': function (l, r) { return l == r; },
      '===': function (l, r) { return l === r; },
      '!=': function (l, r) { return l != r; },
      '!==': function (l, r) { return l !== r; },
      '<': function (l, r) { return l < r; },
      '>': function (l, r) { return l > r; },
      '<=': function (l, r) { return l <= r; },
      '>=': function (l, r) { return l >= r; },
      'typeof': function (l, r) { return typeof l == r; }
  };

  if (!operators[operator]) {
      throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
  }

  result = operators[operator](lvalue, rvalue);

  if (result) {
      return options.fn(this);
  } else {
      return options.inverse(this);
  }

});
// Load in Handlebars templates
var preferences_template = Handlebars.templates["preferences.hbs"];
var editor_tab_template = Handlebars.templates["editor-tab.hbs"];
var editor_template = Handlebars.templates["editor.hbs"];
var active_variables_row_template = Handlebars.templates["active-variable.hbs"];
var history_row_template = Handlebars.templates["history-row.hbs"];
var package_row_template = Handlebars.templates["package-row.hbs"];
var file_template = Handlebars.templates["file-item.hbs"];
var file_search_item_template = Handlebars.templates["file-search-item.hbs"];
var wd_template = Handlebars.templates["wd.hbs"];
var shortcuts_template = Handlebars.templates["shortcuts.hbs"];



// resizeable panes
$("#pane-container").height($(window).height() - $(".navbar").height());

var rc = {}; // getRC();
$("#pane-container").split({
  orientation: 'vertical',
  limit: 100,
  position: rc.paneVertical || '50%'
});

$("#right-column").split({
  orientation: 'horizontal',
  limit: 100,
  position: rc.paneHorizontalRight || '50%'
});

$("#left-column").split({
  orientation: 'horizontal',
  limit: 100,
  position: rc.paneHorizontalLeft || '50%'
});

// on resize w/ gray bars, recalibrate
$(document.documentElement).bind('mouseup.splitter touchend.splitter touchleave.splitter touchcancel.spliter', function(e) {
  // TODO: saveWindowCalibration();
  calibratePanes();
});

window.onresize = function(evt) {
  calibratePanes();
};

function calibratePanes() {
  $("#pane-container").height($(window).height() - $(".navbar").height());
  // Top Left
  var topLeftHeight = $("#top-left").height();
  var offset = $("#top-left #editorsTab").height() + 2;
  $("#top-left #editors").height(topLeftHeight - offset);

  // Bottom Left
  var bottomLeftHeight = $("#bottom-left").height();
  var offset = $("#bottom-left #consoleTab").height() + 1;
  $("#consoleTabContainer").height(bottomLeftHeight - offset);
  // TODO: this is getting called constantly
  // setConsoleWidth($("#console").width());

  // Top Right
  var offset = $("#top-right ul").height() + 1;
  $("#environment").height($("#top-right").height() - offset);
  $("#history").height($("#top-right").height() - offset);
  // $("#vars").height($("#top-right").height()*.7);
  $("#vars-container").height($("#environment").height() - offset);

  // Bottom Right
  var tabOffset = $("#bottom-right .nav-tabs").height() + 1;
  $("#bottomRightTabContent").height($("#bottom-right").height() - tabOffset);
  // files
  $("#file-list").height($("#bottomRightTabContent").height() - $("#working-directory").height());
  // packages
  $("#packages").height($("#bottom-right").height() - tabOffset);
  var offset = 42 + 30 + 1; // $("#packages table").first().height() + $("#packages .row").first().height() + 1;
  $("#packages-container").height($("#packages").height() - offset);

  // plots
  $("#plot-window").height($("#bottom-right").height() - tabOffset);
  var offset = offset + 25 + 5; //13;
  $("#plots img").css("max-height", $("#bottom-right").height() - offset);
  $("#plots-minimap").css("max-height", $("#bottom-right").height() - offset);
  // help
  $("#help-content").parent().height($("#bottom-right").height() - tabOffset);
  $("#help-content").height($("#bottom-right").height() - tabOffset);
  // preferences
  $("#preferences").height($("#bottom-right").height() - tabOffset);
  // $("#preferences .panel-body").height($("#bottom-right").height() - tabOffset);
  $("#preferences").parent().height($("#bottom-right").height() - tabOffset);
  $("#preferences").height($("#bottom-right").height() - tabOffset);

  // scrolling fixes...
  // removes stupid scroll bars on windows/linux
  $("[style*=height]").css("overflow", "hidden");

  // things we actually want to scroll
  // top right
  $("#vars-container").css("overflow-y", "scroll");
  $("#history").css("overflow-y", "scroll");
  // bottom right
  $("#file-list").css("overflow-y", "scroll");
  $("#plots-minimap").css("overflow-y", "scroll");
  $("#packages-container").css("overflow-y", "scroll");
  $("#help-content").css("overflow-y", "scroll");
  $("#preferences").css("overflow-y", "scroll");
}
// Tab stuff
$("#add-tab").click(function(e) {
  e.preventDefault();
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
  createEditor("editor-" + id);
  // set to the active tab
  $("#editor-tab-" + id + " .editor-tab-a").click();
  if (id!="preferences") {
    ace.edit("editor-" + id).focus();
  }
  return false;
});

function track(cat, action, label, value) {
  var data = { cat: cat, action: action, label: label, value: value };
  // TODO: actually track stuff
}

// things that need a place

function serialize(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function sendCommand(input, hideResult) {
  if (input) {
    var html = history_row_template({ n: 1 + $("#history-trail").children().length, command: input });
    $("#history-trail").append(html);
  }

  if (input=="push it to the limit") {
    $("#time-traveler").click();
    return;
  }

  if (/^\?/.test(input)) {
    input = "help(" + input.slice(1) + ")"
  } else if (input=="reset" || input=="%%reset" || input=="%reset" || input=="quit" || input=="quit()" || input=="exit" || input=="exit()") {
    // do quit stuff...
    return;
  }

  // auto scroll down
  $cont = $("#history-trail").parent();
  $cont[0].scrollTop = $cont[0].scrollHeight;

  // actually run the command
  var data = {
    command: input,
    autocomplete: false,
    stream: true
  };

  $.get("/command", data, function(results) {
    var results = results.trim().split('\n');
    for(var i=0; i < results.length; i++) {
      var result = JSON.parse(results[i]);

      if (result.stream) {
        jqconsole.Write(result.stream || "");
      }

      if (/^help[(]/.test(input)) {
        if (result.output) {
          $('#help-content').text(result.output);
          $('a[href="#help"]').tab("show");
        }
      }

      if (result.image || result.html) {
        addPlot(result);
      }

      if (result.error) {
        track('command', 'error');
        jqconsole.Write(result.error + '\n', 'jqconsole-error');
      }

      if (result.status=="complete") {
        jqconsole.Write('\n');
        refreshVariables();
      }
    }
  });
}

// execute script button
$("#run-button").click(function(e) {
  e.preventDefault();
  var id = $("#editors .active .editor").attr("id");
  var editor = ace.edit(id);
  var code = editor.getSelectedText();
  // if nothing was selected, then we'll run the entire file
  if (! code) {
    code = editor.session.getValue();
  }
  jqconsole.Write(">>> " + code + '\n', 'jqconsole-old-input');
  sendCommand(code);
  return false;
})

function executeCommand(command, autocomplete, fn) {
  var data = {
    "command": command,
    "autocomplete": autocomplete,
    stream: false
  };

  $.get("/command", data, fn);
}

function showPreferences() {
  $('a[href^="#preferences"]').click();
}

// misc startup stuff...
$("#tour").owlCarousel({ singleItem: true });
setTimeout(calibratePanes, 450);
$('[data-toggle="tooltip"]').tooltip();


// tell server if we're online or offline
var updateOnlineStatus = function() {
  console.log(navigator.onLine ? 'online' : 'offline');
};
// send subsequent changes to status
window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline',  updateOnlineStatus);

// TODO: not sure why this isn't working but it should be
$("#file-upload-trigger").change(function () {
  var input = document.getElementById('file-upload-trigger');
  var file = input.files[0];
  var fr = new FileReader();
  fr.readAsText(file);
  var filename = $(this).val().replace("C:\\fakepath\\", '');
  newEditor(filename, filename, fr.result);
});
