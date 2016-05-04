/**
 * todo: Somehow we need to convert this all to client-side
 */

'use strict';

const _ = require('lodash'),
  electron = require('electron'),
  util = require('util'),
  shell = electron.shell,
  knownActions = require('../../../public/jsx/actions/known'),
  indexMenuDefinition = require('./index.json'),
  //dialogs = require('dialogs')({url: '../../static/img/cowboy-hat.svg'}),
  Menu = electron.Menu,
  MenuItem = electron.MenuItem;

function getMenuShortcutsTemplate() {
  return [
    {
      label: 'Rodeo',
      submenu: [
        {
          label: 'About Rodeo',
          click: function () {
            showAbout();
          }
        },
        {
          label: 'Stickers',
          click: function () {
            $('#sticker-modal').modal('show');
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: function () {
            showPreferences();
            track('shortcut', 'Preferences');
          }
        },
        {
          label: 'Default Variables',
          accelerator: 'CmdOrCtrl+g',
          click: function () {
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
          click: function () {
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
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: function () {
            track('shortcut', 'New');
            $('#add-tab').click();
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: function () {
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
          click: function () {
            track('shortcut', 'Save');
            saveEditor();
          }
        },
        {
          label: 'Save As',
          // accelerator: 'CmdOrCtrl+C',
          click: function () {
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
          click: function () {
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
        },
        {
          label: 'Find File',
          accelerator: 'CmdOrCtrl+t',
          click: function () {
            track('shortcut', 'Find File');
            findFile();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo'},
        {label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo'},
        {type: 'separator'},
        {label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut'},
        {label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy'},
        {label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste'},
        {label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll'}
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
              click: function () {
                track('shortcut', 'Change Editor > Move One Left');
                var tab = $('#editorsTab'),
                  prevTab = tab.find('.active').prev();

                if (prevTab && $('a', prevTab).attr('href') != '#') {
                  $('a', prevTab).click();
                } else {
                  $('a', tab.find('li').last().prev()).click()
                }
              }
            },
            {
              label: 'Move One Right',
              accelerator: 'CmdOrCtrl+Alt+Right',
              click: function () {
                track('shortcut', 'Change Editor > Move One Right');
                var tab = $('#editorsTab'),
                  nextTab = tab.find('.active').next();

                if (nextTab && $('a', nextTab).attr('href') != '#') {
                  $('a', nextTab).click();
                } else {
                  $('a', tab.find('li').first().next()).click();
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
              click: function () {
                track('shortcut', 'Focus > Editor');
                var id = $('#editors').find('.active .editor').attr('id'),
                  editor = ace.edit(id);

                editor.focus();
              }
            },
            {
              label: 'Console',
              accelerator: 'CmdOrCtrl+2',
              click: function () {
                track('shortcut', 'Focus > Console');
                jqconsole.Focus();
              }
            },
            {
              label: 'Variables/History',
              accelerator: 'CmdOrCtrl+3',
              click: function () {
                track('shortcut', 'Focus > Variables/History');
                var topRight = $('#top-right'),
                  next = topRight.find('.nav .active').next();

                if (!$(next).length) {
                  next = topRight.find('.nav li').first();
                }
                $('a', next).click();
              }
            },
            {
              label: 'Files/Plots/Packages/Help',
              accelerator: 'CmdOrCtrl+4',
              click: function () {
                track('shortcut', 'Focus > Files/Plots/Pacakges/Help');
                var bottomRight = $('#bottom-right'),
                  next = bottomRight.find('.nav .active').next();

                if (!$(next).length) {
                  next = bottomRight.find('.nav li').first();
                }
                $('a', next).click();
              }
            }
          ]
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Command+Shift+F',
          click: function () {
            var isFull = remote.getCurrentWindow().isFullScreen();

            remote.getCurrentWindow().setFullScreen(!isFull);
          }
        },
        {
          label: 'Toggle Dev Tools',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: function () {
            remote.getCurrentWindow().toggleDevTools();
          }
        }
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
          click: function () {
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
        },
        {
          label: 'Zoom',
          submenu: [
            {
              label: 'Zoom to Default',
              accelerator: 'CmdOrCtrl+0',
              click: function () {
                track('shortcut', 'Zoom > Default');
                webFrame.setZoomLevel(0);
                calibratePanes();
              }
            },
            {
              label: 'Zoom In',
              accelerator: 'CmdOrCtrl+=',
              click: function () {
                track('shortcut', 'Zoom > Zoom In');
                webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
                calibratePanes();
              }
            },
            {
              label: 'Zoom Out',
              accelerator: 'CmdOrCtrl+-',
              click: function () {
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
          click: function () {
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
        },
        {
          label: 'Set Working Directory',
          accelerator: 'CmdOrCtrl+Shift+g',
          click: function () {
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
              click: function () {
                track('shortcut', 'Session > Run Previous Command > 2nd to Last');
                sendCommand($('#history-trail').children().slice(-2, -1).text());
              }
            },
            {
              label: 'Last',
              accelerator: 'CmdOrCtrl+Shift+1',
              click: function () {
                track('shortcut', 'Session > Run Previous Command > Last');
                sendCommand($('#history-trail').children().slice(-1).text());
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
          click: function () {
            ipcMain.send('check-for-updates');
          }
        },
        {
          label: 'View Shortcuts',
          // no shortcut (?)
          click: function () {
            var modal = $('#shortcut-display-modal');

            modal.modal('show');
            modal.find('input').focus();
          }
        },
        {
          label: 'Docs',
          click: function () {
            shell.openExternal('http://yhat.github.io/rodeo-docs/docs/');
          }
        },
        {
          label: 'Tour',
          click: function () {
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
        }
      ]
    }
  ];
}

// context menu for file nav
function getFileMenuTemplate() {
  return [
    {
      label: 'Change Working Directory',
      click: function () {
        setWorkingDirectory();
      }
    },
    {
      label: 'Add Folder',
      click: function () {
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
    }
  ];
}

// context menu for file nav
function getFolderMenuTemplate() {
  return [
    {
      label: 'Reveal in Finder',
      click: function () {
        shell.showItemInFolder(folderMenu.filename);
      }
    },
    {
      label: 'Delete',
      click: function () {
        dialogs.confirm('Are you sure you want to delete ' + path.basename(folderMenu.filename) +
          '? This will remove all files and directories within this folder.', function (ok) {

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
    }
  ];
}

function toElectronMenu(ipcEmitter, definition) {
  const menu = _.cloneDeep(definition);
  
  return _.map(menu, function (itemDefinition) {
    const clickAction = itemDefinition.click,
      clickActionType = clickAction && clickAction.type,
      submenu = itemDefinition.submenu,
      item = _.pickBy(itemDefinition, _.isString); // clone all strings
    
    if (_.isArray(submenu)) {
      item.submenu = toElectronMenu(submenu);
    } else {
      throw new Error('Bad menu configuration: ' + util.inspect(originalItem));
    }

    if (_.isString(clickActionType)) {
      if (knownActions[clickActionType]) {
        item.click = ipcEmitter.send.bind(ipcEmitter, 'dispatch', clickAction);
      } else {
        throw new Error('Unknown action type ' + clickActionType);
      }
    }
  });
}

let menu = Menu.buildFromTemplate(getMenuShortcutsTemplate()),
  fileMenu = Menu.buildFromTemplate(getFileMenuTemplate()),
  folderMenu = Menu.buildFromTemplate(getFolderMenuTemplate());

Menu.setApplicationMenu(menu);

module.exports.toElectronMenu = toElectronMenu;