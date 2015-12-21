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
var markdown_template = Handlebars.templates["markdown-output.hbs"];
var bad_python_template = Handlebars.templates["bad-python.hbs"];
var python_test_output_template = Handlebars.templates["python-test-output.hbs"];

// Tab stuff
$("#add-tab").click(function(e) {
  e.preventDefault();
  addEditor();
  return false;
});

function track(cat, action, label, value) {
  getRC(function(rc) {
    var data = {
      an: "Rodeo",          // app name
      av: rc.version,       // app version
      cid: rc.id,           // user id
      ec: cat,              // event category
      ea: action,           // event action
      el: label             // event label
    }

    var url = "http://rodeo-analytics.yhathq.com/?" + serialize(data);
    if (navigator.onLine==true) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // good to go
          // console.log("metric tracked!");
        } else {
          console.error("error with metrics");
        }
      }
      request.send();
    }
  });
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


// tell server if we're online or offline
var updateOnlineStatus = function() {
  console.log(navigator.onLine ? 'online' : 'offline');
};
// send subsequent changes to status
window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline',  updateOnlineStatus);
