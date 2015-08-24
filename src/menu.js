var remote = require('remote');
var Menu = remote.require('menu');
var template = [
  {
    label: 'Rodeo',
    submenu: [
      {
        label: 'About Rodeo',
        selector: 'orderFrontStandardAboutPanel:'
      },
      {
        type: 'separator'
      },
      // {
      //   label: 'Preferences',
      //   accelerator: 'CmdOrCtrl+,',
      //   click: function() {
      //     showPreferences();
      //   }
      // },
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
        selector: 'terminate:'
      },
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        selector: 'new:'
      },
      {
        label: 'Open',
        accelerator: 'Shift+CmdOrCtrl+O',
        click: function() {
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
          saveEditor();
        }
      },
      {
        label: 'Save As',
        // accelerator: 'CmdOrCtrl+C',
        click: function() {
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
          var n = $("#editorsTab .active").attr("id").replace("editor-tab-", "");
          closeActiveTab(n);
        }
      },
      {
        label: 'Close All Files',
        click: function() {
          alert("TODO");
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
              ace.edit($("#editors .active").attr("id")).focus();
            }
          },
          {
            label: 'Console',
            accelerator: 'CmdOrCtrl+2',
            click: function() {
              jqconsole.Focus();
            }
          }
        ]
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function() { remote.getCurrentWindow().reload(); }
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: function() { remote.getCurrentWindow().toggleDevTools(); }
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
        label: 'Close',
        // accelerator: 'CmdOrCtrl+W',
        selector: 'performClose:'
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
          remote.require('dialog').showMessageBox({
            type: "warning",
            buttons: ["Yes", "Cancel"],
            message: "Are you sure you want to restart your Python session?",
            detail: "Your data and variables will be deleted permanently."
          }, function(reply) {
            if (reply==0) {
              // yes, nuke it
              sendCommand("%reset -f");
            } else
              // do nothing
              return;
            });
        }
      },
      {
        label: 'Set Working Directory',
        click: function() {
          pickWorkingDirectory();
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: []
  }
];

menu = Menu.buildFromTemplate(template);

Menu.setApplicationMenu(menu);
