var shell = require('shell');
var remote = require('remote');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var webFrame = require('web-frame');
var dialogs = require("dialogs")({ url: "../static/img/cowboy-hat.svg" });
var Menu = remote.require('menu');
var ipc = require('ipc');

var template = [
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
          var rodeoProfile = path.join(USER_HOME, '.rodeoprofile');
          if (! fs.existsSync(rodeoProfile)) {
            fse.copySync(path.join(__dirname, "../src", "default-rodeo-profile.txt"), rodeoProfile)
          }
          openFile(path.join(USER_HOME, '.rodeoprofile'));
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
        accelerator: 'Shift+CmdOrCtrl+O',
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
          // findFile();
        }
      }
    ]
  },
  {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "Command+X", selector: "cut:" },
        { label: "Copy", accelerator: "Command+C", selector: "copy:" },
        { label: "Paste", accelerator: "Command+V", selector: "paste:" },
        { label: "Select All", accelerator: "Command+A", selector: "selectAll:" }
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
            accelerator: 'CmdOrCtrl+Shift+Left',
            click: function() {
              track('shortcut', 'Change Editor > Move One Left');
              var prevTab = $("#editorsTab .active").prev();
              if (prevTab && $("a", prevTab).attr("href")!="#") {
                $("a", prevTab).click();
              }
            }
          },
          {
            label: 'Move One Right',
            accelerator: 'CmdOrCtrl+Shift+Right',
            click: function() {
              track('shortcut', 'Change Editor > Move One Right');
              var nextTab = $("#editorsTab .active").next();
              if (nextTab && $("a", nextTab).attr("href")!="#") {
                $("a", nextTab).click();
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
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function() {
          track('shortcut', 'Reload');
          remote.getCurrentWindow().reload();
        }
      },
      { label: 'Toggle Dev Tools', accelerator: 'Alt+CmdOrCtrl+I', click: function() { remote.getCurrentWindow().toggleDevTools(); } },
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
        click: function() {
          track('shortcut', 'Session > Restart Session');
          remote.require('dialog').showMessageBox({
            type: "warning",
            buttons: ["Yes", "Cancel"],
            message: "Are you sure you want to restart your Python session?",
            detail: "Your data and variables will be deleted permanently."
          }, function(reply) {
            if (reply==0) {
              // yes, nuke it
              sendCommand("%reset -f", false);
              refreshVariables();
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
          pickWorkingDirectory();
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
          shell.openExternal("https://rodeo.yhathq.com/");
        }
      }
    ]
  }
];

menu = Menu.buildFromTemplate(template);

Menu.setApplicationMenu(menu);

// context menu for file nav
var template = [
  {
    label: 'Change Working Directory',
    click: function() {
      pickWorkingDirectory();
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
