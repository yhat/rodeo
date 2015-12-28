var shell = require('shell');
var remote = require('remote');
var path = require('path');
var webFrame = require('web-frame');
var dialogs = require("dialogs")({ url: "../../static/img/cowboy-hat.svg" });
var Menu = remote.require('menu');
var ipc = require('ipc');

var menuShortcutsTemplate = [
  {
    label: 'Rodeo',
    submenu: [
      {
        label: 'About Rodeo',
        click: function() {
          showAbout();
        }
      },
      {
        label: 'Stickers',
        click: function() {
          $("#sticker-modal").modal('show');
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences',
        accelerator: 'CmdOrCtrl+,',
        click: function() {
          showPreferences();
          track('shortcut', 'Preferences');
        }
      },
      {
        label: 'Default Variables',
        accelerator: 'CmdOrCtrl+g',
        click: function() {
          showRodeoProfile();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide Rodeo',
        accelerator: 'CmdOrCtrl+H',
        selector: 'hide:'
      },
      {
        label: 'Hide Others',
        accelerator: 'CmdOrCtrl+Shift+H',
        selector: 'hideOtherApplications:'
      },
      {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function() {
          if ($("#editorsTab .unsaved:not(.hide)").length) {
            remote.require('dialog').showMessageBox({
              type: "warning",
              buttons: ["Yes", "Cancel"],
              message: "You have unsaved files in your Rodeo session. Are you sure you want to quit?",
              detail: "These files will be deleted permanently."
            }, function(reply) {
              if (reply==0) {
                // yes, nuke it
                ipc.send('quit');
              } else {
                // do nothing
                return;
              }
            });
          } else {
            ipc.send('quit');
          }
        }
      },
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: function() {
          track('shortcut', 'New');
          $("#add-tab").click();
        }
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: function() {
          track('shortcut', 'Open');
          openDialog();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+s',
        click: function() {
          track('shortcut', 'Save');
          saveEditor();
        }
      },
      {
        label: 'Save As',
        // accelerator: 'CmdOrCtrl+C',
        click: function() {
          track('shortcut', 'Save As');
          saveEditor(null, true);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Close File',
        accelerator: 'CmdOrCtrl+w',
        click: function() {
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
            if ($("#editorsTab .active").length) {
              var n = $("#editorsTab .active").attr("id").replace("editor-tab-", "");
              closeActiveTab(n);
            }
          }
          track('shortcut', 'Close File');
        }
      },
      {
        label: 'Find File',
        accelerator: 'CmdOrCtrl+t',
        click: function() {
          track('shortcut', 'Find File');
          findFile();
        }
      }
    ]
  },
  {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" }
      ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Change Editor',
        submenu: [
          {
            label: 'Move One Left',
            accelerator: 'CmdOrCtrl+Alt+Left',
            click: function() {
              track('shortcut', 'Change Editor > Move One Left');
              var prevTab = $("#editorsTab .active").prev();
              if (prevTab && $("a", prevTab).attr("href")!="#") {
                $("a", prevTab).click();
              } else {
                $("a", $("#editorsTab li").last().prev()).click()
              }
            }
          },
          {
            label: 'Move One Right',
            accelerator: 'CmdOrCtrl+Alt+Right',
            click: function() {
              track('shortcut', 'Change Editor > Move One Right');
              var nextTab = $("#editorsTab .active").next();
              if (nextTab && $("a", nextTab).attr("href")!="#") {
                $("a", nextTab).click();
              } else {
                $("a", $("#editorsTab li").first().next()).click();
              }
            }
          }
        ]
      },
      {
        label: 'Focus',
        submenu: [
          {
            label: 'Editor',
            accelerator: 'CmdOrCtrl+1',
            click: function() {
              track('shortcut', 'Focus > Editor');
              var id = $("#editors .active .editor").attr("id");
              var editor = ace.edit(id);
              editor.focus();
            }
          },
          {
            label: 'Console',
            accelerator: 'CmdOrCtrl+2',
            click: function() {
              track('shortcut', 'Focus > Console');
              jqconsole.Focus();
            }
          },
          {
            label: 'Variables/History',
            accelerator: 'CmdOrCtrl+3',
            click: function() {
              track('shortcut', 'Focus > Variables/History');
              var next = $("#top-right .nav .active").next();
              if (! $(next).length) {
                next = $("#top-right .nav li").first();
              }
              $("a", next).click()
            }
          },
          {
            label: 'Files/Plots/Packages/Help',
            accelerator: 'CmdOrCtrl+4',
            click: function() {
              track('shortcut', 'Focus > Files/Plots/Pacakges/Help');
              var next = $("#bottom-right .nav .active").next();
              if (! $(next).length) {
                next = $("#bottom-right .nav li").first();
              }
              $("a", next).click()
            }
          }
        ]
      },
      {
        label: 'Toggle Full Screen',
        accelerator: 'Command+Shift+F',
        click: function() {
          var isFull = remote.getCurrentWindow().isFullScreen();
          remote.getCurrentWindow().setFullScreen(!isFull);
        }
      },
      {
        label: 'Toggle Dev Tools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: function() {
          remote.getCurrentWindow().toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        selector: 'performMiniaturize:'
      },
      {
        label: 'Reset Windows to Default Sizes',
        click: function() {
          remote.require('dialog').showMessageBox({
            type: "warning",
            buttons: ["Yes", "Cancel"],
            message: "This will restart your Rodeo session. Are you sure you want to continue?",
            detail: "Any unsaved scripts and data will be deleted permanently."
          }, function(reply) {
            if (reply==0) {
              updateRC("paneVertical", null);
              updateRC("paneHorizontalRight", null);
              updateRC("paneHorizontalLeft", null);
              remote.getCurrentWindow().reload();
            } else {
              // do nothing
              return;
            }
          });
        }
      },
      {
        label: 'Zoom',
        submenu: [
          {
            label: 'Zoom to Default',
            accelerator: 'CmdOrCtrl+0',
            click: function() {
              track('shortcut', 'Zoom > Default');
              webFrame.setZoomLevel(0);
              calibratePanes();
            }
          },
          {
            label: 'Zoom In',
            accelerator: 'CmdOrCtrl+=',
            click: function() {
              track('shortcut', 'Zoom > Zoom In');
              webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
              calibratePanes();
            }
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl+-',
            click: function() {
              track('shortcut', 'Zoom > Zoom Out');
              webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
              calibratePanes();
            }
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      }
    ]
  },
  {
    label: 'Session',
    submenu: [
      {
        label: 'Restart Session',
        accelerator: 'CmdOrCtrl+R',
        click: function() {
          track('shortcut', 'Session > Restart Session');
          remote.require('dialog').showMessageBox({
            type: "warning",
            buttons: ["Yes", "Cancel"],
            message: "Reloading will restart your Rodeo session. Are you sure you want to continue?",
            detail: "Any unsaved scripts and data will be deleted permanently."
          }, function(reply) {
            if (reply==0) {
              remote.getCurrentWindow().reload();
            } else {
              // do nothing
              return;
            }
          });
        }
      },
      {
        label: 'Set Working Directory',
        accelerator: 'CmdOrCtrl+Shift+g',
        click: function() {
          track('shortcut', 'Session > Set Working Directory');
          setWorkingDirectory();
        }
      },
      {
        label: 'Run Previous Command',
        submenu: [
          {
            label: '2nd to Last',
            accelerator: 'CmdOrCtrl+Shift+2',
            click: function() {
              track('shortcut', 'Session > Run Previous Command > 2nd to Last');
              sendCommand($("#history-trail").children().slice(-2, -1).text());
            }
          },
          {
            label: 'Last',
            accelerator: 'CmdOrCtrl+Shift+1',
            click: function() {
              track('shortcut', 'Session > Run Previous Command > Last');
              sendCommand($("#history-trail").children().slice(-1).text());
            }
          }
        ]
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Check for Updates',
        click: function() {
          ipc.send('check-for-updates');
        }
      },
      {
        label: 'View Shortcuts',
        // no shortcut (?)
        click: function() {
          $("#shortcut-display-modal").modal('show');
          $("#shortcut-display-modal input").focus();
        }
      },
      {
        label: 'Docs',
        click: function() {
          shell.openExternal("http://yhat.github.io/rodeo-docs/docs/");
        }
      },
      {
        label: 'Tour',
        click: function() {
          $("#tour-modal").modal('show');
        }
      }
    ]
  }
];

menu = Menu.buildFromTemplate(menuShortcutsTemplate);

Menu.setApplicationMenu(menu);

// context menu for file nav
var template = [
  {
    label: 'Change Working Directory',
    click: function() {
      setWorkingDirectory();
    }
  },
  {
    label: 'Add Folder',
    click: function() {
      dialogs.prompt("Enter a name for your new folder: ", function(dirname) {
        if (dirname) {
          addFolderToWorkingDirectory(dirname);
        }
      });
    }
  }
];

fileMenu = Menu.buildFromTemplate(template);


// context menu for file nav
var template = [
  {
    label: 'Reveal in Finder',
    click: function() {
      shell.showItemInFolder(folderMenu.filename);
    }
  },
  {
    label: 'Delete',
    click: function() {
      dialogs.confirm("Are you sure you want to delete " + path.basename(folderMenu.filename) +"? This will remove all files and directories within this folder.", function(ok) {
        if (ok) {
          shell.moveItemToTrash(folderMenu.filename);
          setFiles(USER_WD);
        }
      });
    }
  }
];

folderMenu = Menu.buildFromTemplate(template);
