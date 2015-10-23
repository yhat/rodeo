
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

Handlebars.registerHelper('toJSON', function(context) {
  return JSON.stringify(context);
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
var menu_item_template = Handlebars.templates["menu-item.hbs"];
var nav_item_template = Handlebars.templates["nav-item.hbs"];

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
  if (isDesktop()) {
    ipc.send('command', data);
  } else {
    $.get("command", data, function(results) {
      handleCommandResults(results);
    });
  }
}

function handleCommandResults(results) {
  var results = results.trim().split('\n');
  for(var i=0; i < results.length; i++) {
    var result = JSON.parse(results[i]);

    if (result.stream) {
      jqconsole.Write(result.stream || "");
    }

    if (/^help[(]/.test(result.command)) {
      if (result.output) {
        $('#help-content').text(result.output);
        $('a[href="#help"]').tab("show");
        return;
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
}

if (isDesktop()) {
  ipc.on('command', function(data) {
    handleCommandResults(data);
  })
}

// execute script button
$("#run-button").click(function(e) {
  e.preventDefault();
  var editor = getActiveEditor();
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

  if (isDesktop()) {
    var results = ipc.sendSync('command', data);
    fn(results);
  } else {
    $.get("command", data, fn);
  }
}

function showPreferences() {
  $('a[href^="#preferences"]').click();
}

// misc startup stuff...
$("#tour").owlCarousel({ singleItem: true });
$('[data-toggle="tooltip"]').tooltip();
setTimeout(calibratePanes, 450);
setupWindows();

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
