import ace from 'ace';
import * as store from './store';
import $ from 'jquery';
import { send } from './ipc';
import templates from 'templates';

const validEmailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
  validFonts = [
    'Consolas',
    'Courier New',
    'Menlo',
    'Monaco'
  ];

export function setEditorTheme(theme) {
  $('.editor').each(function (i, item) {
    const editor = ace.edit(item.id);

    editor.setTheme(theme);
  });
  store.set('editorTheme', theme);
}

ace.require('ace/keyboard/vim');
ace.require('ace/keyboard/emacs');

export function setKeyBindings(binding) {
  $('.editor').each(function (i, item) {
    const editor = ace.edit(item.id);

    if (binding == 'default') {
      binding = null;
    }
    editor.setKeyboardHandler(binding);
  });
  store.set('keyBindings', binding);
}

export function setFontSize(fontSize) {
  const fontSizeInt = parseInt(fontSize);

  fontSize = Math.min(fontSizeInt, 22) + 'px';
  $('body').css('font-size', fontSize);
  $('#console').find('pre').css('font-size', fontSize);
  $('.editor').each(function (i, item) {
    const editor = ace.edit(item.id);

    editor.setFontSize(fontSize);
  });
  store.set('fontSize', fontSizeInt);
}

export function setFontType(fontType) {
  $('body').css('font-family', fontType);
  // $('#console pre').css('font-family', fontType);
  $('.editor').each(function (i, item) {
    const editor = ace.edit(item.id);

    if (validFonts.indexOf(fontType) > -1) {
      editor.setOption('fontFamily', fontType);
    }
  });
  store.set('fontType', fontType);
}

export function setDefaultWd(wd) {
  store.set('defaultWd', wd);
}

export function setTheme(theme) {
  const $rodeoTheme = $('#rodeo-theme');

  if ($rodeoTheme.attr('href') !== theme) {
    $rodeoTheme.attr('href', theme);
  }
  store.set('theme', theme);
}

export function setPythonCmd(cmd) {
  if (cmd) {
    cmd = cmd.replace('~', store.get('userHome'));
    store.set('pythonCmd', cmd);
  } else {
    store.set('pythonCmd', null);
  }
}

export function setAutoSave(val) {
  store.set('autoSave', val);
}

export function setDisplayDotFiles(val) {
  store.set('displayDotFiles', val);
}

export function setTracking(val) {
  store.set('trackingOn', val);
}

export function saveWindowCalibration() {
  const $leftColumn = $('#left-column'),
    paneVertical = 100 * $leftColumn.width() / $('#pane-container').width(),
    paneHorizontalRight = 100 * $('#top-right').height() / $('#right-column').height(),
    paneHorizontalLeft = 100 * $('#top-left').height() / $leftColumn.height();

  store.set('paneVertical', paneVertical + '%');
  store.set('paneHorizontalRight', paneHorizontalRight + '%');
  store.set('paneHorizontalLeft', paneHorizontalLeft + '%');
}

export function resetWindowCalibration() {
  bootbox.dialog({
    title: 'This will restart your Rodeo session. Are you sure you want to continue?',
    message: 'Any unsaved scripts and data will be deleted permanently.',
    buttons: {
      cancel: {
        label: 'Cancel',
        className: 'btn-default',
        callback: function () {}
      },
      yes: {
        label: 'Yes',
        className: 'btn-primary',
        callback: function () {
          store.set('paneVertical', null);
          store.set('paneHorizontalRight', null);
          store.set('paneHorizontalLeft', null);
          window.location.reload();
        }
      }
    }
  });
}

export function changeDefaultPath(pythonPath) {
  if (pythonPath == 'add-path') {
    $('#default-python-modal').modal('show');
  } else {
    setPythonCmd(pythonPath);
    bootbox.dialog({
      title: 'Your default Python environment has been updated.',
      message: 'For the changes to take affect, you\'ll need to restart Rodeo. Would you like to do this now?',
      buttons: {
        cancel: {
          label: 'No',
          className: 'btn-default',
          callback: function () {}
        },
        yes: {
          label: 'Yes',
          className: 'btn-primary',
          callback: function () {
            require('remote').getCurrentWindow().reload();
          }
        }
      }
    });
  }
}

export function showRodeoProfile() {
  // should do something special here...

  const userHome = store.get('homedir'),
    profilePath = pathJoin([userHome, '.rodeoprofile']);

  openFile(profilePath);
}

export function configurePreferences() {
  let keyBindings = store.get('keyBindings'),
    defaultWd = store.get('defaultWd'),
    pythonPaths = store.get('pythonPaths'),
    pythonCmd = store.get('pythonCmd'),
    trackingOn = store.get('trackingOn'),
    theme = store.get('theme'),
    fontSize = store.get('fontSize'),
    fontType = store.get('fontType');


  // todo: to localStorage
  keyBindings = keyBindings || 'default';
  defaultWd = defaultWd || '';
  fontType = fontType || 'Helvetica Neue';
  pythonPaths = pythonPaths || [];
  
  if (pythonCmd && pythonPaths.indexOf(pythonCmd) < 0) {
    pythonPaths.push(pythonCmd);
  }

  if (trackingOn !== false) {
    trackingOn = true;
  }

  let preferences_html = templates.preferences({
      keyBindings,
      defaultWd,
      pythonPaths,
      pythonCmd,
      trackingOn,
      fontSize,
      fontType
    }),
    $preferences = $('#preferences');

  $preferences.children().remove();
  $preferences.append(preferences_html);
  $('[data-toggle="tooltip"]').tooltip();

  // on startup, set defaults for non-editor preferences
  // if (defaultWd) { // && fs.existsSync(rc.defaultWd)) {
  //   USER_WD = defaultWd;
  // } else {
  //   USER_WD = store.get('userHome');
  // }
  if (theme) {
    setTheme(theme);
  }
  
  if (fontSize) {
    setFontSize(fontSize);
  }
  
  if (fontType) {
    setFontType(fontType);
  }
}

$('#add-path-button').click(function (e) {
  var newPath = $('#new-python-path').val();
  var data = ipc.send('test-path', newPath);
  if (data) {
    if (data.jupyter && data.matplotlib) {
      var result = ipc.send('add-python-path', newPath);
      if (result==true) {
        $('#python-paths').append(templates['python-path-item'](newPath));

        bootbox.dialog({
          title: 'Would you like this to be your default python environment?',
          message: 'If you do, Rodeo will restart for the changes to take affect.',
          buttons: {
            cancel: {
              label: 'No',
              className: 'btn-default',
              callback: function () {
                setupPreferences();
              }
            },
            yes: {
              label: 'Yes',
              className: 'btn-primary',
              callback: function () {
                setPythonCmd(newPath);
                setupPreferences();
                require('remote').getCurrentWindow().reload();
              }
            }
          }
        });

      } else {
        $('#add-path-help').text('Could not add python path: ' + result);
      }
    } else if (! data.jupyter) {
      $('#add-path-help').text('The path you specified did not have jupyter installed. Please install jupyter before adding a path.');
    }
  } else {
    $('#add-path-help').text('Invalid Python. Rodeo could not run Python using the path you specified.');
  }
});

export function deletePythonPath(el) {
  // ???
  return send('remove_python_path', $(el).data('path')).then(function () {
    $(el).parent().remove();
    setupPreferences();
  });
}

export function showPreferences() {
  $('a[href^="#preferences"]').click();
}

export function setupPreferences() {
  configurePreferences();
}

export function registerEmail() {
  const email = $('#sticker-email').val();

  if (email && validEmailRegex.test(email)) {
    window.Intercom('update', { email: email });
    $('#sticker-form').addClass('hide');
    $('#sticker-success').removeClass('hide');
    $('#sticker-help').text('');
    store.set('email', email);
  } else {
    $('#sticker-help').text('Please input a valid email address.');
  }
}
