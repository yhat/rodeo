'use strict';

/**
 * Generates unique ids
 */

var guid = window.guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };
}();
'use strict';

/**
 * Wrapper around ipcRenderer so we can wrap it later with something else
 * @type {{send: function, on: function}}
 */

var ipc = window.ipc = function () {
  var cid = function () {
    var i = 0;return function () {
      return i++;
    };
  }(),
      ipcRender = require('electron').ipcRenderer;

  function toArgs(obj) {
    return Array.prototype.slice.call(obj, 0);
  }

  function on(emitter) {
    return function (eventName, eventFn) {
      try {
        emitter.on(eventName, function () {
          var eventResult = void 0,
              eventArgs = toArgs(arguments);

          eventResult = eventFn.apply(null, eventArgs);
          console.log('ipc event trigger completed', eventName, eventResult);
          return eventResult;
        });
        console.log('ipc event registered', eventName, eventFn.name);
        return emitter;
      } catch (ex) {
        console.error('ipc event error', eventName, ex);
      }
    };
  }

  function send(emitter) {
    return function () {
      var eventId = cid().toString(),
          args = toArgs(arguments),
          eventName = args[0];

      return new Promise(function (resolve, reject) {
        var _response = void 0,
            eventReplyName = eventName + '_reply';

        console.log('ipc sending', [eventName, eventId].concat(args.slice(1)));
        emitter.send.apply(emitter, [eventName, eventId].concat(args.slice(1)));
        _response = function response(event, id) {
          var result = void 0;
          if (id === eventId) {
            ipcRender.removeListener(eventReplyName, _response);
            result = toArgs(arguments).slice(2);
            if (result[0]) {
              reject(new Error(result[0].message));
            } else {
              resolve(result[1]);
            }
          } else {
            console.log(eventName, eventId, 'passed on', arguments);
          }
        };
        console.log('ipc waiting for ', eventName, eventId, 'on', eventReplyName);
        ipcRender.on(eventReplyName, _response);
      });
    };
  }

  return {
    send: send(ipcRender),
    on: on(ipcRender)
  };
}();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var store = window.store = function () {
  function get(key) {
    var result = window.localStorage.getItem(key);

    if (result) {
      try {
        result = JSON.parse(result);
      } catch (ex) {
        // we're okay with this
      }
    }
    return result;
  }

  function set(key, value) {
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
      value = JSON.stringify(value);
    }
    window.localStorage.setItem(key, value);
  }

  return {
    get: get,
    set: set
  };
}();
"use strict";

function isDesktop() {
  return (/^file:\/\//.test(window.location.href)
  );
}

function updateRC(preferenceName, preferenceValue) {
  if (isDesktop()) {
    return ipc.send("preferences-post", { name: preferenceName, value: preferenceValue });
  } else {
    $.post("preferences", { name: preferenceName, value: preferenceValue });
  }
}

function pathJoin(parts) {
  // if windows, separator = '\\\\';
  var separator;
  if (navigator.platform == "Win32") {
    separator = '\\\\';
  } else {
    separator = '/';
  }
  var replace = new RegExp(separator + '{1,}', 'g');
  return parts.join(separator).replace(replace, separator);
}
"use strict";

$("#package-install-button").click(function (e) {
  $("#package-install-modal").modal('show');
  $("#package-install-modal input").focus();
});

$("#package-install-modal form").submit(function (e) {
  e.preventDefault();
  var installer = $("[name='installerRadio']:checked").val();
  var pkgname = $("#package-to-install").val();
  var command;
  if (installer == "pip") {
    command = "__pip_install('" + pkgname + "')";
  } else {
    command = "! conda install -y " + pkgname;
  }

  jqconsole.ClearPromptText();
  jqconsole.Write(">>> " + command + '\n', 'jqconsole-old-input');
  jqconsole.SetHistory(jqconsole.GetHistory().concat([command]));
  sendCommand(command);
  return false;
});
/**
 * todo: Somehow we need to convert this all to client-side
 */

'use strict';

var shell = require('shell'),
    remote = require('remote'),
    BrowserWindow = require('electron').remote.BrowserWindow,
    path = require('path'),
    fs = require('fs'),
    webFrame = require('web-frame'),
    dialogs = require('dialogs')({ url: '../../static/img/cowboy-hat.svg' }),
    Menu = remote.require('menu'),
    ipcMain = require('electron').ipcMain;

function getMenuShortcutsTemplate() {
  return [{
    label: 'Rodeo',
    submenu: [{
      label: 'About Rodeo',
      click: function click() {
        showAbout();
      }
    }, {
      label: 'Stickers',
      click: function click() {
        $('#sticker-modal').modal('show');
      }
    }, {
      type: 'separator'
    }, {
      label: 'Preferences',
      accelerator: 'CmdOrCtrl+,',
      click: function click() {
        showPreferences();
        track('shortcut', 'Preferences');
      }
    }, {
      label: 'Default Variables',
      accelerator: 'CmdOrCtrl+g',
      click: function click() {
        showRodeoProfile();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Hide Rodeo',
      accelerator: 'CmdOrCtrl+H',
      selector: 'hide:'
    }, {
      label: 'Hide Others',
      accelerator: 'CmdOrCtrl+Shift+H',
      selector: 'hideOtherApplications:'
    }, {
      label: 'Show All',
      selector: 'unhideAllApplications:'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function click() {
        if ($('#editorsTab .unsaved:not(.hide)').length) {
          remote.require('dialog').showMessageBox({
            type: 'warning',
            buttons: ['Yes', 'Cancel'],
            message: 'You have unsaved files in your Rodeo session. Are you sure you want to quit?',
            detail: 'These files will be deleted permanently.'
          }, function (reply) {
            if (reply == 0) {
              // yes, nuke it
              ipcMain.send('quit');
            }
          });
        } else {
          ipcMain.send('quit');
        }
      }
    }]
  }, {
    label: 'File',
    submenu: [{
      label: 'New',
      accelerator: 'CmdOrCtrl+N',
      click: function click() {
        track('shortcut', 'New');
        $('#add-tab').click();
      }
    }, {
      label: 'Open',
      accelerator: 'CmdOrCtrl+O',
      click: function click() {
        track('shortcut', 'Open');
        openDialog();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Save',
      accelerator: 'CmdOrCtrl+s',
      click: function click() {
        track('shortcut', 'Save');
        saveEditor();
      }
    }, {
      label: 'Save As',
      // accelerator: 'CmdOrCtrl+C',
      click: function click() {
        track('shortcut', 'Save As');
        saveEditor(null, true);
      }
    }, {
      type: 'separator'
    }, {
      label: 'Close File',
      accelerator: 'CmdOrCtrl+w',
      click: function click() {
        var active, n;

        if (variableWindow && variableWindow.isFocused()) {
          variableWindow.close();
          variableWindow = null;
        } else if (aboutWindow && aboutWindow.isFocused()) {
          aboutWindow.close();
          aboutWindow = null;
        } else if (markdownWindow && markdownWindow.isFocused()) {
          markdownWindow.close();
          markdownWindow = null;
        } else {
          active = $('#editorsTab').find('.active');
          if (active.length) {
            n = active.attr('id').replace('editor-tab-', '');
            closeActiveTab(n);
          }
        }
        track('shortcut', 'Close File');
      }
    }, {
      label: 'Find File',
      accelerator: 'CmdOrCtrl+t',
      click: function click() {
        track('shortcut', 'Find File');
        findFile();
      }
    }]
  }, {
    label: 'Edit',
    submenu: [{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' }, { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' }, { type: 'separator' }, { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' }, { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' }, { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }, { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }]
  }, {
    label: 'View',
    submenu: [{
      label: 'Change Editor',
      submenu: [{
        label: 'Move One Left',
        accelerator: 'CmdOrCtrl+Alt+Left',
        click: function click() {
          track('shortcut', 'Change Editor > Move One Left');
          var tab = $('#editorsTab'),
              prevTab = tab.find('.active').prev();

          if (prevTab && $('a', prevTab).attr('href') != '#') {
            $('a', prevTab).click();
          } else {
            $('a', tab.find('li').last().prev()).click();
          }
        }
      }, {
        label: 'Move One Right',
        accelerator: 'CmdOrCtrl+Alt+Right',
        click: function click() {
          track('shortcut', 'Change Editor > Move One Right');
          var tab = $('#editorsTab'),
              nextTab = tab.find('.active').next();

          if (nextTab && $('a', nextTab).attr('href') != '#') {
            $('a', nextTab).click();
          } else {
            $('a', tab.find('li').first().next()).click();
          }
        }
      }]
    }, {
      label: 'Focus',
      submenu: [{
        label: 'Editor',
        accelerator: 'CmdOrCtrl+1',
        click: function click() {
          track('shortcut', 'Focus > Editor');
          var id = $('#editors').find('.active .editor').attr('id'),
              editor = ace.edit(id);

          editor.focus();
        }
      }, {
        label: 'Console',
        accelerator: 'CmdOrCtrl+2',
        click: function click() {
          track('shortcut', 'Focus > Console');
          jqconsole.Focus();
        }
      }, {
        label: 'Variables/History',
        accelerator: 'CmdOrCtrl+3',
        click: function click() {
          track('shortcut', 'Focus > Variables/History');
          var topRight = $('#top-right'),
              next = topRight.find('.nav .active').next();

          if (!$(next).length) {
            next = topRight.find('.nav li').first();
          }
          $('a', next).click();
        }
      }, {
        label: 'Files/Plots/Packages/Help',
        accelerator: 'CmdOrCtrl+4',
        click: function click() {
          track('shortcut', 'Focus > Files/Plots/Pacakges/Help');
          var bottomRight = $('#bottom-right'),
              next = bottomRight.find('.nav .active').next();

          if (!$(next).length) {
            next = bottomRight.find('.nav li').first();
          }
          $('a', next).click();
        }
      }]
    }, {
      label: 'Toggle Full Screen',
      accelerator: 'Command+Shift+F',
      click: function click() {
        var isFull = remote.getCurrentWindow().isFullScreen();

        remote.getCurrentWindow().setFullScreen(!isFull);
      }
    }, {
      label: 'Toggle Dev Tools',
      accelerator: 'Alt+CmdOrCtrl+I',
      click: function click() {
        remote.getCurrentWindow().toggleDevTools();
      }
    }]
  }, {
    label: 'Window',
    submenu: [{
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      selector: 'performMiniaturize:'
    }, {
      label: 'Reset Windows to Default Sizes',
      click: function click() {
        remote.require('dialog').showMessageBox({
          type: 'warning',
          buttons: ['Yes', 'Cancel'],
          message: 'This will restart your Rodeo session. Are you sure you want to continue?',
          detail: 'Any unsaved scripts and data will be deleted permanently.'
        }, function (reply) {
          if (reply == 0) {
            updateRC('paneVertical', null);
            updateRC('paneHorizontalRight', null);
            updateRC('paneHorizontalLeft', null);
            remote.getCurrentWindow().reload();
          }
        });
      }
    }, {
      label: 'Zoom',
      submenu: [{
        label: 'Zoom to Default',
        accelerator: 'CmdOrCtrl+0',
        click: function click() {
          track('shortcut', 'Zoom > Default');
          webFrame.setZoomLevel(0);
          calibratePanes();
        }
      }, {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: function click() {
          track('shortcut', 'Zoom > Zoom In');
          webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
          calibratePanes();
        }
      }, {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: function click() {
          track('shortcut', 'Zoom > Zoom Out');
          webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
          calibratePanes();
        }
      }]
    }, {
      type: 'separator'
    }, {
      label: 'Bring All to Front',
      selector: 'arrangeInFront:'
    }]
  }, {
    label: 'Session',
    submenu: [{
      label: 'Restart Session',
      accelerator: 'CmdOrCtrl+R',
      click: function click() {
        track('shortcut', 'Session > Restart Session');
        remote.require('dialog').showMessageBox({
          type: 'warning',
          buttons: ['Yes', 'Cancel'],
          message: 'Reloading will restart your Rodeo session. Are you sure you want to continue?',
          detail: 'Any unsaved scripts and data will be deleted permanently.'
        }, function (reply) {
          if (reply == 0) {
            remote.getCurrentWindow().reload();
          }
        });
      }
    }, {
      label: 'Set Working Directory',
      accelerator: 'CmdOrCtrl+Shift+g',
      click: function click() {
        track('shortcut', 'Session > Set Working Directory');
        setWorkingDirectory();
      }
    }, {
      label: 'Run Previous Command',
      submenu: [{
        label: '2nd to Last',
        accelerator: 'CmdOrCtrl+Shift+2',
        click: function click() {
          track('shortcut', 'Session > Run Previous Command > 2nd to Last');
          sendCommand($('#history-trail').children().slice(-2, -1).text());
        }
      }, {
        label: 'Last',
        accelerator: 'CmdOrCtrl+Shift+1',
        click: function click() {
          track('shortcut', 'Session > Run Previous Command > Last');
          sendCommand($('#history-trail').children().slice(-1).text());
        }
      }]
    }]
  }, {
    label: 'Help',
    submenu: [{
      label: 'Check for Updates',
      click: function click() {
        ipcMain.send('check-for-updates');
      }
    }, {
      label: 'View Shortcuts',
      // no shortcut (?)
      click: function click() {
        var modal = $('#shortcut-display-modal');

        modal.modal('show');
        modal.find('input').focus();
      }
    }, {
      label: 'Docs',
      click: function click() {
        shell.openExternal('http://yhat.github.io/rodeo-docs/docs/');
      }
    }, {
      label: 'Tour',
      click: function click() {
        var tourWindow = new BrowserWindow({
          useContentSize: true,
          resizable: false,
          moveable: false,
          center: true,
          alwaysOnTop: true
        });

        // tourWindow.openDevTools();
        tourWindow.on('closed', function () {
          tourWindow = null;
        });

        // and load the index.html of the app.
        tourWindow.loadURL('file://' + __dirname + '../../static/tour.html');
      }
    }]
  }];
}

// context menu for file nav
function getFileMenuTemplate() {
  return [{
    label: 'Change Working Directory',
    click: function click() {
      setWorkingDirectory();
    }
  }, {
    label: 'Add Folder',
    click: function click() {
      dialogs.prompt('Enter a name for your new folder: ', function (dirname) {
        if (dirname) {
          fs.mkdir(path.join(store.get('userWorkingDirectory'), dirname));
          setFiles(store.get('userWorkingDirectory')).then(function (data) {
            console.log('Add Folder click', data);
          }).catch(function (error) {
            console.error('Add Folder click', error);
          });
        }
      });
    }
  }];
}

// context menu for file nav
function getFolderMenuTemplate() {
  return [{
    label: 'Reveal in Finder',
    click: function click() {
      shell.showItemInFolder(folderMenu.filename);
    }
  }, {
    label: 'Delete',
    click: function click() {
      dialogs.confirm('Are you sure you want to delete ' + path.basename(folderMenu.filename) + '? This will remove all files and directories within this folder.', function (ok) {

        if (ok) {
          shell.moveItemToTrash(folderMenu.filename);
          setFiles(store.get('userWorkingDirectory')).then(function (data) {
            console.log('Delete click', data);
          }).catch(function (error) {
            console.error('Delete click', error);
          });
        }
      });
    }
  }];
}

var menu = Menu.buildFromTemplate(getMenuShortcutsTemplate()),
    fileMenu = Menu.buildFromTemplate(getFileMenuTemplate()),
    folderMenu = Menu.buildFromTemplate(getFolderMenuTemplate());

Menu.setApplicationMenu(menu);
'use strict';

// Plots
function previousPlot() {
  track('plot', 'previous');
  var currentPlot = $("#plots .active");
  if ($("#plots .active").prev().length) {
    var plotid = $("#plots .active").prev().data("plot-id");
    activatePlot(plotid);
  }
}

function nextPlot() {
  track('plot', 'next');
  var currentPlot = $("#plots .active");
  if ($("#plots .active").next().length) {
    var plotid = $("#plots .active").next().data("plot-id");
    activatePlot(plotid);
  }
}

function deletePlot() {
  track('plot', 'delete');
  var currentplotid = $("#plots .active").data("plot-id");
  var plotid;
  if ($("#plots .active").next().length) {
    plotid = $("#plots .active").next().data("plot-id");
    activatePlot(plotid);
  } else if ($("#plots .active").prev().length) {
    plotid = $("#plots .active").prev().data("plot-id");
    activatePlot(plotid);
  }
  $("#plots [data-plot-id='" + currentplotid + "']").remove();
  $("#plots-minimap [data-plot-id='" + currentplotid + "']").remove();
}

function activatePlot(plotid) {
  $("#plots .active").removeClass("active").addClass("hide");
  $("#plots-minimap .active").removeClass("active");
  $("#plots [data-plot-id='" + plotid + "']").removeClass("hide").addClass("active");
  $("#plots-minimap [data-plot-id='" + plotid + "']").addClass("active");
}

function showPlot() {
  track('plot', 'show');
  if (!$("#plots img.active").length) {
    return;
  }
  if (isDesktop()) {
    var BrowserWindow = remote.require('browser-window');
    var filename = $("#plots img.active").attr("src");
    var params = { toolbar: false, resizable: false, show: true, height: 1000, width: 1000 };
    var plotWindow = new BrowserWindow(params);
    plotWindow.loadURL(filename);
  } else {
    var filename = $("#plots img.active").attr("src");
    var newWindow = window.open("", "Rodeo Markdown", "width=" + $(window).width() * 0.6 + ",height=" + $(window).height() + ",scrollbars=1,resizable=1");
    // read text from textbox placed in parent window
    newWindow.document.open();
    var img = '<img src="' + filename + '" />';
    newWindow.document.write("<html><body>" + img + "</body>");
    newWindow.document.close();
  }
}

function savePlot() {
  track('plot', 'save');
  if (!$("#plots .active").length) {
    return;
  }
  if (isDesktop()) {
    remote.require('dialog').showSaveDialog({
      title: 'Export Plot',
      default_path: ipc.send('wd-get')
    }, function (destfile) {
      if (!destfile) {
        return;
      }

      if (!/\.png$/.test(destfile)) {
        destfile += ".png";
      }

      if ($("#plots img.active").length) {
        // if image
        var img = $("img.active").attr("src").replace("data:image/png;charset=utf-8;base64,", "");
        require('fs').writeFileSync(destfile, img, 'base64');
      } else {
        // if svg
        var svg = document.getElementsByTagName("svg")[0];
        svgAsDataUri(svg, {}, function (uri) {
          img = uri.replace("data:image/svg+xml;base64,", "");
          require('fs').writeFileSync(destfile, img, 'base64');
        });
      }
    });
  } else {
    bootbox.alert("Right-click the plot to save.");
  }
}

function addPlot(result) {
  var plotid = guid();
  if (result.image) {
    var plotImage = "data:image/png;charset=utf-8;base64," + result.image;
    $("#plots-minimap .active").removeClass("active");
    $("#plots .active").removeClass("active").addClass("hide");
    var newplot = $.parseHTML('<img class="active" style="max-height: 100%; max-width: 100%;" />');
    $(newplot).attr("src", plotImage);
  } else if (result.html) {
    $("#plots .active").removeClass("active").addClass("hide");
    //  TODO: need to handle the sizing here
    result.html = result.html.replace(/600px/g, "95%");
    var newplot = $.parseHTML('<div class="active">' + result.html + "</div>");
  }
  $(newplot).attr("onclick", "activatePlot($(this).data('plot-id'));");
  $(newplot).attr("data-plot-id", plotid);
  // add to plotting window and to minimap
  $("#plots").append($(newplot).clone());
  $("#plots-minimap").prepend($(newplot).clone());
  $('a[href="#plot-window"]').tab("show");
  calibratePanes();
}
'use strict';

// basic search for history
$('#pkg-search').on('input', function () {
  var query = $(this).val().toLowerCase();
  if (query == "") {
    $("#packages-rows tr").removeClass("hide");
  } else {
    $("#packages-rows tr").each(function (i, pkg) {
      var packageName = $("td", pkg).first().text().toLowerCase();
      if (packageName.indexOf(query) >= 0) {
        $(this).removeClass("hide");
      } else {
        $(this).addClass("hide");
      }
    });
  }
});

// basic search for packages
$('#history-search').on('input', function () {
  var query = $(this).val().toLowerCase();
  if (query == "") {
    $("#history-trail p").removeClass("hide");
  } else {
    $("#history-trail p").each(function (i, cmd) {
      var cmdText = $(cmd).text().toLowerCase();
      if (cmdText.indexOf(query) >= 0) {
        $(this).removeClass("hide");
      } else {
        $(this).addClass("hide");
      }
    });
  }
});

// basic search for packages
$('#variable-search').on('input', function () {
  var query = $(this).val().toLowerCase();
  if (query == "") {
    $("#vars tr").removeClass("hide");
  } else {
    $("#vars tr").each(function (i, variable) {
      var variableName = $("td", variable).text().toLowerCase();
      if (variableName.indexOf(query) >= 0) {
        $(this).removeClass("hide");
      } else {
        $(this).addClass("hide");
      }
    });
  }
});
"use strict";

// Tab stuff
$("#add-tab").click(function (e) {
  e.preventDefault();
  addEditor();
  return false;
});
"use strict";

$("#file-upload-trigger").change(function () {
  var input = document.getElementById('file-upload-trigger');
  var file = input.files[0];
  var fr = new FileReader();
  fr.onload = function (theFile) {
    return function (e) {
      var filename = theFile.name.replace("C:\\fakepath\\", '');
      newEditor(filename, filename, e.target.result);
    };
  }(file);
  fr.readAsText(file);
});
"use strict";

function fileIndexStart() {
  $("#file-search-list .list").children().remove();
  $("#file-search-list .list").append("<li id='index-count'><i class='fa fa-hourglass-end'></i>&nbsp;Indexing files</li>");
}

function indexFile(data) {
  var fileSearchItem = templates['file-search-item'](data);
  $("#file-search-list .list").append(fileSearchItem);
}

function fileIndexUpdate(data) {
  var html = "<i class='fa fa-hourglass-end'></i>&nbsp;Indexing files " + data.nComplete;
  $("#file-search-list .list #index-count").html(html);
}

function fileIndexInterrupt() {
  $("#file-search-list .list").children().remove();
  var msg = "Sorry this directory was too big to index.";
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
  var options = { valueNames: ['filename'] };
  fileList = new List('file-search-list', options);
  $("#file-search-form").unbind();
  $("#file-search-form").submit(function (e) {
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
  executeCommand("__get_variables(globals())", false, function (result) {
    if (!result.output) {
      $("#vars").children().remove();
      console.error("[ERROR]: Result from code execution was null.");
      return;
    }
    var variables = JSON.parse(result.output);
    $("#vars").children().remove();
    var variableTypes = ["list", "dict", "ndarray", "DataFrame", "Series", "function", "other"];
    variableTypes.forEach(function (type) {
      var isOnDesktop = isDesktop();
      variables[type].forEach(function (v) {
        $("#vars").append(templates['active-variable']({
          name: v.name, type: type, repr: v.repr, isDesktop: isOnDesktop
        }));
      }.bind(this));
    });
    // configure column widths
    $("#vars tr").first().children().each(function (i, el) {
      $($("#vars-header th")[i]).css("width", $(el).css("width"));
    });
  });
}

function refreshPackages() {
  executeCommand("__get_packages()", false, function (result) {
    var packages = JSON.parse(result.output);
    $("#packages-rows").children().remove();
    packages.forEach(function (p) {
      $("#packages-rows").append(templates['package-row']({ name: p.name, version: p.version }));
    });
  });
}

function findFile() {
  $("#file-search-modal").unbind();
  $("#file-search-modal").modal("show");
  $("#file-search-modal input").focus();
  $("#file-search-modal").keydown(function (e) {
    var selectedFile = $("#file-search-list .list .selected").data("filename");
    if (!fileList) {
      return;
    }
    var nextFile;
    if (e.which == 40) {
      // down
      for (var i = 0; i < fileList.matchingItems.length - 1; i++) {
        if ($(fileList.matchingItems[i].elm).data("filename") == selectedFile) {
          nextFile = $(fileList.matchingItems[i + 1].elm).data("filename");
          break;
        }
      }
      if (!nextFile) {
        nextFile = $(fileList.matchingItems[0].elm).data("filename");
      }
    } else if (e.which == 38) {
      // up
      for (var i = fileList.matchingItems.length - 1; i > 0; i--) {
        if ($(fileList.matchingItems[i].elm).data("filename") == selectedFile) {
          nextFile = $(fileList.matchingItems[i - 1].elm).data("filename");
          break;
        }
      }
      if (!nextFile) {
        nextFile = $(fileList.matchingItems[fileList.matchingItems.length - 1].elm).data("filename");
      }
    }

    $("#file-search-list .list li").each(function (i, el) {
      if ($(el).data("filename") == nextFile) {
        $("#file-search-list .list .selected").removeClass("selected");
        $(el).addClass("selected");
        // keep selected item in the center
        var $parentDiv = $("#file-search-list ul");
        var $innerListItem = $(el);
        $parentDiv.scrollTop($parentDiv.scrollTop() + $innerListItem.position().top - $parentDiv.height() / 1.5 + $innerListItem.height() / 3);
      }
    });
  });
}

function setDefaultPreferences(editor) {
  var keyBindings = store.get('keyBindings'),
      editorTheme = store.get('editorTheme'),
      fontSize = store.get('fontSize'),
      autoSave = store.get('autoSave');

  editor.setKeyboardHandler(keyBindings === 'default' ? null : keyBindings); // null is the "default"
  editor.setTheme(editorTheme || 'ace/theme/chrome');
  editor.setFontSize(fontSize || 12);

  if (autoSave) {
    editor.on('input', function () {
      saveEditor();
    });
  }
}

function saveActiveEditor(saveas) {
  saveas = saveas || false;
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
  if (prevTab && $("a", prevTab).attr("href") != "#") {
    $("a", prevTab).click();
  } else {
    prevTab = $("#editorsTab li").last().prev();
    $("a", prevTab).click();
  }
  var id = $(prevTab).attr("id").replace("tab-", "");
  ace.edit(id).focus();
}

function shiftEditorRight() {
  var nextTab = $("#editorsTab .active").next();
  if (nextTab && $("a", nextTab).attr("href") != "#") {
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
    $.post('file', payload, function (resp) {
      fn(resp);
    });
  }
}

function closeActiveTab(n) {
  if (!$("#editor-tab-" + n + " .unsaved").hasClass("hide")) {
    bootbox.dialog({
      title: "Do you want to save the changes you've made to this file?",
      message: "Your changes will be discarded otherwise.",
      buttons: {
        cancel: {
          label: "Cancel",
          className: "btn-default",
          callback: function callback() {
            return;
          }
        },
        dontSave: {
          label: "Don't Save",
          className: "btn-default",
          callback: function callback() {
            $("#editorsTab .editor-tab-a").first().click();
            $("#editor-tab-" + n).remove();
            $("#editor-tab-pane-" + n).remove();
          }
        },
        save: {
          label: "Save",
          className: "btn-primary",
          callback: function callback() {
            saveEditor(ace.edit("editor-" + n), null, function () {
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
    if (prevTab && $("a", prevTab).attr("href") != "#") {
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
    setFiles(pathname).then(function (data) {
      console.log('openFile', data);
    }).catch(function (error) {
      console.error('openFile', error);
    });
  } else {
    var data;

    (function () {
      var callback = function callback(basename, pathname, content) {
        var editor = newEditor(basename, pathname, content);
        // [+] tab is always the last tab, so we'll activate the 2nd to last tab
        $("#editorsTab li:nth-last-child(2) a").click();
        var id = $("#editors .editor").last().attr("id");
        // set to not modified -- NOT IDEAL but it works :)
        setTimeout(function () {
          $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
        }, 50);
      };

      if (isDesktop()) {
        data = ipc.send('file-get', pathname);

        callback(data.basename, pathname, data.content);
      } else {
        $.get("file", { filepath: pathname }, function (resp) {
          callback(resp.basename, pathname, resp.content);
        });
      }
    })();
  }
}

function saveEditor(editor, saveas, fn) {
  saveas = saveas || false;
  var id = $($("#editorsTab .active a").attr("href") + " .editor").attr("id");
  if (!editor) {
    editor = ace.edit(id);
  }

  var filename = $("#editorsTab .active a").text();
  var content = editor.getSession().getValue();
  if (!$("#editorsTab .active a").attr("data-filename") || saveas == true) {
    if (isDesktop()) {
      remote.require('dialog').showSaveDialog({
        title: 'Save File',
        default_path: ipc.send('wd-get')
      }, function (destfile) {
        if (!destfile) {
          return;
        }
        // if there's no file extension specified, we'll assume they meant a python file
        if (!/\.[A-Za-z0-9]{1,5}$/.test(destfile)) {
          destfile = destfile + ".py";
        }
        var basename = pathBasename(destfile);
        $("#editorsTab .active a .name").text(basename);
        $("#editorsTab .active a").attr("data-filename", destfile);
        saveFile(destfile, content, function (resp) {
          $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
          setFiles();
          if (fn) {
            fn();
          }
        });
      });
    } else {
      bootbox.prompt("Please specify a name for your file:", function (destfile) {
        if (destfile == null) {
          return;
        }
        var basename = pathBasename(destfile);
        $("#editorsTab .active a .name").text(basename);
        $("#editorsTab .active a").attr("data-filename", destfile);
        saveFile(destfile, content, function (resp) {
          $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
          setFiles();
          if (fn) {
            fn();
          }
        });
      });
    }
  } else {
    saveFile($("#editorsTab .active a").attr("data-filename"), content, function (resp) {
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
  }, function (filenames) {
    if (filenames && filenames.length > 0) {
      openFile(filenames[0]);
    }
  });
}
"use strict";

function addEditor() {
  var id;
  if ($("#editors .editor").length) {
    id = parseInt($("#editors .editor").last().attr("id").split("-")[1]) + 1;
  } else {
    id = 1;
  }

  var editor_tab_html = templates['editor-tab']({ n: id, name: "Untitled-" + id + ".py", isFirst: id == 0 });
  var editor_html = templates.editor({ n: id });

  $(editor_tab_html).insertBefore($("#add-tab").parent());
  $("#editors").append(editor_html);
  // set to the active tab
  $("#editor-tab-" + id + " .editor-tab-a").click();
  var editor = ace.edit("editor-" + id);
  editor = configureEditor(editor);
  editor.focus();
  return editor;
}
'use strict';

function getCurrentLine(editor) {
  return editor.session.getLine(editor.getCursorPosition().row);
}

function configureEditor(editor) {

  track('application', 'editor');

  var langTools = ace.require("ace/ext/language_tools");
  // this removes local completer
  langTools.setCompleters([]);

  var Autocomplete = ace.require("ace/autocomplete").Autocomplete;
  editor.completer = new Autocomplete(editor);
  editor.setTheme("ace/theme/chrome");
  editor.getSession().setMode("ace/mode/python");
  editor.setOptions({
    useSoftTabs: true,
    showPrintMargin: false,
    enableBasicAutocompletion: true,
    enableSnippets: false,
    enableLiveAutocompletion: false
  });
  editor.$blockScrolling = Infinity;

  // Autocomplete
  var pythonCompleter = {
    getCompletions: function getCompletions(editor, session, pos, prefix, fn) {
      session.$mode.$keywordList = [];
      // get the current line from the begining of the line to the cursor
      var code = getCurrentLine(editor).slice(0, editor.getCursorPosition().column);

      executeCommand(code, true, function (result) {
        console.log(result);
        result.output = JSON.parse(result.output);
        var predictions = result.output.map(function (p) {
          var value = p.text;
          // if it's not a filename and there's a "." in the value, we want
          // to set the value to just the last item in the list
          if (value.indexOf("/") == -1 && value.indexOf(".") > -1) {
            value = value.split(".").slice(value.split(".").length - 1).join(".");
          }

          return {
            caption: p.text,
            value: value,
            score: 100,
            meta: null,
            docHTML: "<code>" + p.text + "</code>" + "<br/>" + "<br/>" + "<pre style='margin: 0; padding: 0;'>" + p.docstring + "</pre>" || "<p>" + p.text + "</p>"
            // docHTML: "<code>" + p.text + "</code>" + "<br/>" + "<br/>" + "<pre style='margin: 0; padding: 0;'>" + p.docstring + "</pre>" || "<p>" + p.text + "</p>"
          };
        });

        fn(null, predictions);
      });
    }
  };
  langTools.addCompleter(pythonCompleter);

  // start shortcuts

  // TODO: fix this...
  var allCommands = editor.commands.byName;
  editor.commands.bindKey("Cmd-d", null);
  allCommands.findnext.bindKey = { win: "Ctrl-d", mac: "Cmd-d" };
  editor.commands.addCommand(allCommands.findnext);

  editor.commands.addCommand({
    name: "shift-editor-left",
    bindKey: { win: "ctrl-option-left", mac: "ctrl-option-left" },
    exec: function exec(editor) {
      track('shortcut', 'Change Editor > Move One Left');
      shiftEditorLeft();
    }
  });

  editor.commands.addCommand({
    name: "shift-editor-right",
    bindKey: { win: "ctrl-option-right", mac: "ctrl-option-right" },
    exec: function exec(editor) {
      track('shortcut', 'Change Editor > Move One Right');
      shiftEditorRight();
    }
  });

  // override the settings menu
  editor.commands.addCommand({
    name: "showPreferences",
    bindKey: { win: "ctrl-,", mac: "Command-," },
    exec: function exec(editor) {
      track('shortcut', 'Preferences');
      showPreferences();
    }
  });

  // override cmd+shift+g
  editor.commands.addCommand({
    name: "pickWorkingDirectory",
    bindKey: { win: "ctrl-Shift-g", mac: "Command-Shift-g" },
    exec: function exec(editor) {
      track('shortcut', 'Change Working Directory');
      setWorkingDirectory();
    }
  });

  // override cmt+t
  editor.commands.addCommand({
    name: "findFile",
    bindKey: { win: "ctrl-option-t", mac: "Command-option-t" },
    exec: function exec(editor) {
      track('shortcut', 'Find File');
      findFile();
    }
  });

  editor.commands.addCommand({
    name: "findFile2",
    bindKey: { win: "ctrl-k", mac: "Command-k" },
    exec: function exec(editor) {
      findFile();
    }
  });

  // indent selection
  editor.commands.addCommand({
    name: "indentSelection",
    bindKey: { win: "ctrl-\]", mac: "Command-\]" },
    exec: function exec(editor) {
      if (editor.getSelectedText()) {
        editor.blockIndent(editor.getSelectionRange());
      } else {
        editor.blockIndent(editor.getCursorPosition().row);
      }
    }
  });

  // outdent selection
  editor.commands.addCommand({
    name: "outSelection",
    bindKey: { win: "ctrl-\[", mac: "Command-\[" },
    exec: function exec(editor) {
      if (editor.getSelectedText()) {
        editor.blockOutdent(editor.getSelectionRange());
      } else {
        editor.blockOutdent(editor.getCursorPosition().row);
      }
    }
  });

  editor.commands.addCommand({
    name: "sendCommand",
    bindKey: { win: "ctrl-Enter", mac: "Command-Enter" },
    exec: function exec(editor) {
      track('command', 'python');
      // grab selected text
      var text = editor.getCopyText();

      // get the current line number and the next line number
      var currentRow = editor.getSelectionRange().end.row;
      var nextRow = currentRow + 1;

      // if they don't have anything highlighted (i.e. going 1 line at a time), then
      //  we need to be a little tricky
      if (text == "") {
        text = editor.session.getLine(currentRow);
      }
      text = jqconsole.GetPromptText() + text;

      var isFinished = false;
      if (nextRow == editor.session.getLength()) {
        // we're done. send the code
        isFinished = true;
      } else if (editor.session.getLine(nextRow) == "") {
        // we're done. send the code
        isFinished = true;
      } else if (/return/.test(editor.session.getLine(currentRow))) {
        // we're done. send the code
        isFinished = true;
      } else if (!/^ /.test(editor.session.getLine(nextRow))) {
        isFinished = true;
      } else {
        // well then we're still going...
      }

      if (isFinished) {
        jqconsole.SetPromptText(text);
        jqconsole.Write(jqconsole.GetPromptText(true) + '\n');
        jqconsole.ClearPromptText();
        jqconsole.SetHistory(jqconsole.GetHistory().concat([text]));
        sendCommand(text);
        // this seems to behave better without the scroll getting in th way...
        // editor.scrollToLine(currentRow + 1, true, true, function () {});
      } else {
          text = text + '\n';
          jqconsole.ClearPromptText();
          jqconsole.SetPromptText(text);
        }
      if (nextRow == editor.session.getLength()) {
        editor.session.setValue(editor.session.getValue() + "\n");
      }
      editor.gotoLine(currentRow + 2, 10, true);
    }
  });

  editor.commands.addCommand({
    name: "saveFile",
    bindKey: { win: "ctrl-s", mac: "Command-s" },
    exec: function exec(editor) {
      saveEditor(editor);
    }
  });

  editor.commands.addCommand({
    name: "cancelInput",
    bindKey: { win: "ctrl-shift-c", mac: "ctrl-c" },
    exec: function exec(editor) {
      jqconsole.SetPromptText('');
    }
  });

  editor.commands.addCommand({
    name: "autocomplete",
    bindKey: { win: "Tab", mac: "Tab" },
    exec: function exec(editor) {
      var pos = editor.getCursorPosition();
      var text = editor.session.getTextRange({
        start: { row: pos.row, column: pos.column - 1 },
        end: { row: pos.row, column: pos.column }
      });

      var line = getCurrentLine(editor);

      // Don't ask about the setTimeout-50 business. This bug came out of nowhere.
      // Everything was working fine without it and then all of a sudden it popped
      // up. I'm not even sure how I thought that this might fix it. It was a
      // total shot in the dark. Million to one shot doc, million to one.
      if (/from /.test(line) || /import /.test(line)) {
        setTimeout(function () {
          editor.completer.showPopup(editor);
        }, 50);
      } else if (text != " " && text != "") {
        setTimeout(function () {
          editor.completer.showPopup(editor);
        }, 50);
      } else {
        editor.insert("    ");
      }
    }
  });
  // generic shortcuts
  // Focus
  editor.commands.addCommand({
    name: "focus-2",
    bindKey: { win: "ctrl-2", mac: "Command-2" },
    exec: function exec(editor) {
      focusOnConsole();
    }
  });
  editor.commands.addCommand({
    name: "focus-3",
    bindKey: { win: "ctrl-3", mac: "Command-3" },
    exec: function exec(editor) {
      focusOnTopRight();
    }
  });
  editor.commands.addCommand({
    name: "focus-4",
    bindKey: { win: "ctrl-4", mac: "Command-4" },
    exec: function exec(editor) {
      focusOnBottomRight();
    }
  });
  // Run previous
  editor.commands.addCommand({
    name: "runLastCommand",
    bindKey: { win: "ctrl-shift-1", mac: "Command-shift-1" },
    exec: function exec(editor) {
      runLastCommand();
    }
  });
  editor.commands.addCommand({
    name: "run2ndToLastCommand",
    bindKey: { win: "ctrl-shift-2", mac: "Command-shift-2" },
    exec: function exec(editor) {
      run2ndToLastCommand();
    }
  });
  // new file
  editor.commands.addCommand({
    name: "newFile",
    bindKey: { win: "ctrl-option-shift-n", mac: "ctrl-option-shift-n" },
    exec: function exec(editor) {
      $("#add-tab").click();
    }
  });

  if (!isDesktop()) {
    editor.commands.addCommand({
      name: "openUserFile",
      bindKey: { win: "ctrl-o", mac: "command-o" },
      exec: function exec(editor) {
        $('#file-upload-trigger').click();
      }
    });
    editor.commands.addCommand({
      name: "closeOpenFile",
      bindKey: { win: "ctrl-option-shift-w", mac: "command-option-shift-w" },
      exec: function exec(editor) {
        var n = $("#editorsTab .active").attr("id").replace("editor-tab-", "");
        closeActiveTab(n);
        getActiveEditor().focus();
      }
    });
    editor.commands.addCommand({
      name: "closeOpenFile2",
      bindKey: { win: "ctrl-b", mac: "command-b" },
      exec: function exec(editor) {
        var n = $("#editorsTab .active").attr("id").replace("editor-tab-", "");
        closeActiveTab(n);
        getActiveEditor().focus();
      }
    });
  }

  // end shortcuts

  editor.on('input', function () {
    $("#" + editor.container.id.replace("editor", "editor-tab") + " .unsaved").removeClass("hide");
  });

  setDefaultPreferences(editor);
  return editor;
}
'use strict';

var ipc = require('electron').ipcRenderer;

ipc.on('refresh-variables', function () {
  refreshVariables();
});

ipc.on('refresh-packages', function () {
  refreshPackages();
});

ipc.on('setup-preferences', function () {
  setupPreferences();
});

ipc.on('plot', function (result) {
  addPlot(result);
  $('#btn-interrupt').addClass('hide');
});

ipc.on('set-working-directory', function (wd) {
  setFiles(wd).then(function (data) {
    console.log('ipc:set-working-directory', data);
  }).catch(function (error) {
    console.error('ipc:set-working-directory', error);
  });
});

ipc.on('file-index-start', function () {
  fileIndexStart();
});

ipc.on('index-file', function (data) {
  indexFile(data);
});

ipc.on('file-index-update', function (data) {
  fileIndexUpdate(data);
});

ipc.on('file-index-interrupt', function () {
  fileIndexInterrupt();
});

ipc.on('file-index-complete', function () {
  fileIndexComplete();
});

ipc.on('open-file', function (filepath) {
  openFile(filepath);
});

ipc.on('log', function (data) {
  console.log('[LOG]: ' + data.toString());
});

ipc.on('ready', function () {
  $('#loading-modal').modal('hide');
});

ipc.on('no-update', function () {
  var body = "Good news! You're running the most up to date version of Rodeo.";
  new Notification("You're up to date", {
    title: "You're up to date", body: body
  });
});

ipc.on('update-ready', function (data) {
  var body, n;

  if (data.platform === 'windows') {
    body = 'Click here to download the latest version.';
  } else {
    body = 'Click here to update';
  }
  n = new Notification('Update Available', { title: 'Update Available', body: body });
  n.onclick = function () {
    if (data.platform === 'windows') {
      require('shell').openExternal('https://www.yhat.com/products/rodeo/downloads');
    } else {
      ipc.send('update-and-restart');
    }
  };
});

ipc.on('startup-error', function (err) {
  showError(err);
});

ipc.on('start-tour', function () {
  $('#tour-modal').modal('show');
});

ipc.on('prompt-for-sticker', function () {
  $('#sticker-modal').modal('show');
});

ipc.on('activated', function () {});

ipc.send('index-files');
"use strict";

// setup the shortcut display modal here. we're using a handlebars
// template here are a partial (the shortcuts table is really big).
// this keeps this file a lot cleaner.

function initShortcutsDisplay() {
  $("#shortcut-display-modal #shortcuts").append(templates.shortcuts());

  $("#shortcut-search").on('input', function () {
    var query = $(this).val().toLowerCase();
    if (query == "") {
      $("#shortcuts tr .hide").removeClass("hide");
    } else {
      $("#shortcut-rows tr").each(function (i, shortcut) {
        var text = [];
        $("td", shortcut).map(function (i, el) {
          text.push($(el).text());
        });
        text = text.join("-").toLowerCase();
        if (text.indexOf(query) > -1) {
          $(this).removeClass("hide");
        } else {
          $(this).addClass("hide");
        }
      });
    }
  });
}
'use strict';

var aboutWindow;

function showAbout() {
  var params = { toolbar: false, resizable: false, show: true, height: 500, width: 400 };
  var BrowserWindow = remote.require('browser-window');
  aboutWindow = new BrowserWindow(params);
  aboutWindow.loadURL('file://' + __dirname + '/../static/about.html');
  // aboutWindow.openDevTools();
}
'use strict';

var variableWindow;
function showVariable(varname, type) {
  var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };

  var BrowserWindow = remote.require('browser-window');
  variableWindow = new BrowserWindow(params);
  variableWindow.loadURL('file://' + __dirname + '/../static/display-variable.html');
  // variableWindow.openDevTools();

  var show_var_statements = {
    DataFrame: "print(" + varname + "[:1000].to_html())",
    Series: "print(" + varname + "[:1000].to_frame().to_html())",
    list: "pp.pprint(" + varname + ")",
    ndarray: "pp.pprint(" + varname + ")",
    dict: "pp.pprint(" + varname + ")",
    "function": "print(inspect.getsource(" + varname + "))",
    other: "pp.pprint(" + varname + ")"
  };

  variableWindow.webContents.on('dom-ready', function () {
    var showVar = show_var_statements[type];
    if (!showVar) {
      showVar = show_var_statements.other;
    }
    executeCommand(showVar, false, function (result) {
      variableWindow.webContents.send('ping', { type: type, html: result.output });
    });
  });

  variableWindow.on('close', function () {
    variableWindow = null;
  });
}
'use strict';

var markdownWindow;
function renderMarkdown(html) {
  var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };

  var BrowserWindow = remote.require('browser-window');
  markdownWindow = new BrowserWindow(params);

  // I'm not proud of this, but we need the file to be in the same relative directory
  // as our css, js, etc.
  markdownWindow.loadURL('file://' + __dirname + '/../static/markdown-desktop.html');
  markdownWindow.webContents.on('dom-ready', function () {
    markdownWindow.webContents.send('content', { html: html });
  });

  ipc.on('pdf', function (destfile) {
    if (!/\.pdf$/.test(destfile)) {
      destfile = destfile + ".pdf";
    }
    markdownWindow.webContents.printToPDF({}, function (err, data) {
      require('fs').writeFile(destfile, data, function (error) {
        if (err) {
          throw error;
        }
      });
    });
  });
  // markdownWindow.openDevTools();
}
'use strict';

function showError(err) {
  return;

  var params = { toolbar: false, resizable: false, show: true, height: 800, width: 800, alwaysOnTop: true };
  var BrowserWindow = remote.require('browser-window');
  errorWindow = new BrowserWindow(params);
  errorWindow.loadURL('file://' + __dirname + '/../static/setup-error.html');
  errorWindow.openDevTools();
  errorWindow.webContents.on('did-finish-load', function () {
    errorWindow.webContents.send('startup-error', err);
  });

  return;

  $("#loading-modal").modal('hide');
  // $("#error-modal .possible-error").addClass("hide");

  console.log("[ERROR]: ", err);

  if (/python path/.test(err)) {
    $("#good-to-go").addClass("hide");
    $("#install-jupyter").addClass("hide");
    $("#python-path-missing").removeClass("hide");

    $("#output-python").removeClass("hide").removeClass("list-group-item-success").addClass("list-group-item-danger");
    $("#output-python i").removeClass("fa-check").addClass("fa-times");

    $("#output-jupyter").removeClass("hide").removeClass("list-group-item-success").addClass("list-group-item-danger");
    $("#output-jupyter i").removeClass("fa-check").addClass("fa-times");
  } else if (/jupyter/.test(err)) {
    $("#good-to-go").addClass("hide");
    $("#install-jupyter").removeClass("hide");
    $("#python-path-missing").addClass("hide");

    $("#output-python").removeClass("hide").removeClass("list-group-item-danger").addClass("list-group-item-success");
    $("#output-python i").removeClass("fa-times").addClass("fa-check");

    $("#output-jupyter").removeClass("hide").removeClass("list-group-item-success").addClass("list-group-item-danger");
    $("#output-jupyter i").removeClass("fa-check").addClass("fa-times");
  } else {
    $("#good-to-go").removeClass("hide");
    $("#install-jupyter").addClass("hide");
    $("#python-path-missing").addClass("hide");

    $("#output-python").removeClass("hide").removeClass("list-group-item-danger").addClass("list-group-item-success");
    $("#output-python i").removeClass("fa-times").addClass("fa-check");

    $("#output-jupyter").removeClass("hide").removeClass("list-group-item-danger").addClass("list-group-item-success");
    $("#output-jupyter i").removeClass("fa-times").addClass("fa-check");
    // setTimeout(function() {
    //   $("#error-modal").modal('hide');
    // }, 1500);
  }

  $("#error-modal").modal({ backdrop: 'static', keyboard: false, show: true });
  if (/win32/i.test(navigator.platform)) {
    $("#which-python pre").text('c:\\> for %i in (python.exe) do @echo. %~$PATH:i');
    $("#error-modal a").attr("onClick", "shell.openItem('cmd.exe');");
  }
}

function pickPython() {
  require('remote').dialog.showOpenDialog({
    title: "Select your Python",
    properties: ['openFile']
  }, function (pythonPath) {
    $("#python-path").val(pythonPath);
  });
}

function testPath(path) {
  $("#error-modal .possible-error").addClass("hide");
  var data = ipc.send('test-path', path);

  // dramatically unveil the results
  $("#output-jupyter").css("opacity", 0);
  $("#output-python").css("opacity", 0).animate({ opacity: 1, duration: 250 });
  setTimeout(function () {
    $("#output-jupyter").animate({ opacity: 1 });
  }, 750);

  setTimeout(function () {
    if (data.result.status && data.result) {
      if (data.result.jupyter) {
        ipc.send('launch-kernel', path);
        $("#rodeo-ready").removeClass("hide");
        $("#test-results").children().remove();
        setTimeout(function () {
          $("#error-modal").modal('hide');
        }, 3000);
      } else if (data.result.jupyter == false) {
        $("#install-jupyter").removeClass("hide");
      }
    }
  }, 1250 + 400);
}

$("#btn-set-path").click(function (e) {
  var newPath = $("#python-path").val();
  if (newPath) {
    testPath(newPath);
  }
});
//# sourceMappingURL=js.js.map
