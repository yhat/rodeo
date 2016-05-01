import templates from 'templates';
import $ from 'jquery';
import { executeCommand } from '../services/execute';
import * as store from '../services/store';
import { send } from '../services/ipc';
import ace from 'ace';
import bootbox from 'bootbox';
import { setDirectory } from '../services/file-nav';

const variableTypes = ['list', 'dict', 'ndarray', 'DataFrame', 'Series', 'function', 'other'];

export function fileIndexStart() {
  const $list = $('#file-search-list').find('.list');

  $list.children().remove();
  $list.append("<li id='index-count'><i class='fa fa-hourglass-end'></i>&nbsp;Indexing files</li>");
}

export function indexFile(data) {
  const $list = $('#file-search-list').find('.list'),
    fileSearchItem = templates['file-search-item'](data);

  $list.append(fileSearchItem);
}

export function fileIndexUpdate(data) {
  const html = "<i class='fa fa-hourglass-end'></i>&nbsp;Indexing files " + data.nComplete;

  // todo: ??? two ids?
  $('#file-search-list').find('.list #index-count').html(html);
}

export function fileIndexInterrupt() {
  const $list = $('#file-search-list').find('.list'),
    msg = 'Sorry this directory was too big to index.';

  $list.children().remove();
  $list.append("<li id='index-count'><i class='fa fa-ban'></i>&nbsp;" + msg + "</li>");
}

export function fileIndexComplete() {
  const $search = $('#file-search-list');

  // remove the 'indexing...' and make the files visible
  $search.find('#index-count').remove();
  $search.find('.list .hide').removeClass('hide');
  // update the UI
  indexFiles();
}

var fileList;
export function indexFiles() {
  const $li = $('#file-search-list').find('.list li'),
    options = { valueNames: [ 'filename' ] },
    $form = $('#file-search-form');

  $li.removeClass('selected');
  $li.first().addClass('selected');

  fileList = new List('file-search-list', options);
  $form.unbind();
  $form.submit(function (e) {
    e.preventDefault();
    const $list = $('#file-search-list'),
      filename = $list.find('.selected').attr('data-filename');

    openFile(filename);
    $('#file-search-input').val('');
    $('#file-search-modal').modal('hide');
    $list.find('.list li').removeClass('selected');
    return false;
  });
}

export function refreshVariables() {
  return executeCommand('__get_variables(globals())', false).then(function (result) {
    if (!result.output) {
      $('#vars').children().remove();
      throw new Error('Missing result from code execution: ' + result);
    }

    const $vars = $('#vars'),
      variables = JSON.parse(result.output);

    $vars.children().remove();

    variableTypes.forEach(function (type) {
      variables[type].forEach(function (v) {
        $vars.append(templates['active-variable']({
          name: v.name,
          type: type,
          repr: v.repr,
          isDesktop: true
        }));
      }.bind(this));
    });
    // configure column widths
    $vars.find('tr').first().children().each(function (i, el) {
      const $varsHeader = $('#vars-header');

      $($varsHeader.find('th')[i]).css('width', $(el).css('width'));
    });
  });
}

export function refreshPackages() {
  return executeCommand('__get_packages()', false, function (result) {
    const packages = JSON.parse(result.output);

    $('#packages-rows').children().remove();
    packages.forEach(function (p) {
      $('#packages-rows').append(
        templates['package-row']({
          name: p.name,
          version:
          p.version
        })
      );
    });
  });
}

export function findFile() {
  const $fileSearchModal = $('#file-search-modal');

  $fileSearchModal.unbind();
  $fileSearchModal.modal('show');
  $fileSearchModal.find('input').focus();
  $fileSearchModal.keydown(function (e) {
    const $fileSearchList = $('#file-search-list'),
      $list = $fileSearchList.find('.list'),
      $selected = $list.find('.selected'),
      selectedFile = $selected.data('filename');
    let nextFile;

    if (!fileList) {
      return;
    }

    if (e.which === 40) {
      // down
      for (let i = 0; i < fileList.matchingItems.length - 1; i++) {
        if ($(fileList.matchingItems[i].elm).data('filename') == selectedFile) {
          nextFile = $(fileList.matchingItems[i + 1].elm).data('filename');
          break;
        }
      }
      if (!nextFile) {
        nextFile = $(fileList.matchingItems[0].elm).data('filename');
      }
    } else if (e.which == 38) {
      // up
      for (let i = fileList.matchingItems.length - 1; i > 0; i--) {
        if ($(fileList.matchingItems[i].elm).data('filename') == selectedFile) {
          nextFile = $(fileList.matchingItems[i - 1].elm).data('filename');
          break;
        }
      }
      if (!nextFile) {
        nextFile = $(fileList.matchingItems[fileList.matchingItems.length - 1].elm).data('filename');
      }
    }

    $list.find('li').each(function (i, el) {
      if ($(el).data('filename') == nextFile) {
        $selected.removeClass('selected');
        $(el).addClass('selected');
        // keep selected item in the center
        const $parentDiv = $fileSearchList.find('ul'),
          $innerListItem = $(el);

        $parentDiv.scrollTop($parentDiv.scrollTop() + $innerListItem.position().top - $parentDiv.height() / 1.5 + $innerListItem.height() / 3);
      }
    });
  });
}

export function setDefaultPreferences(editor) {
  const keyBindings = store.get('keyBindings'),
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

export function saveActiveEditor(saveAs) {
  saveAs = saveAs || false;
  saveEditor(getActiveEditor(), saveAs);
}

export function closeActiveFile() {
  const $activeEditorTab = $('#editorsTab').find('.active');

  if ($activeEditorTab.length) {
    const n = $activeEditorTab.attr('id').replace('editor-tab-', '');

    closeActiveTab(n);
  }
}

export function shiftEditorLeft() {
  const $editorsTab = $('#editorsTab');
  let id,
    prevTab = $editorsTab.find('.active').prev();

  if (prevTab && $('a', prevTab).attr('href') !== '#') {
    $('a', prevTab).click();
  } else {
    prevTab = $editorsTab.find('li').last().prev();
    $('a', prevTab).click();
  }

  id = $(prevTab).attr('id').replace('tab-', '');
  ace.edit(id).focus();
}

export function shiftEditorRight() {
  const $editorsTab = $('#editorsTab');
  let id,
    nextTab = $editorsTab.find('.active').next();

  if (nextTab && $('a', nextTab).attr('href') !== '#') {
    $('a', nextTab).click();
  } else {
    nextTab = $editorsTab.find('li').first().next();
    $('a', nextTab).click();
  }

  id = $(nextTab).attr('id').replace('tab-', '');
  ace.edit(id).focus();
}

export function getActiveEditor() {
  const id = $('#editors').find('.active .editor').attr('id');

  return ace.edit(id);
}

export function saveFile(filepath, content) {
  return send('file-post', {
    filepath: filepath,
    content: content
  });
}


export function closeActiveTab(n) {
  if (! $('#editor-tab-' + n + ' .unsaved').hasClass('hide')) {
    bootbox.dialog({
      title: 'Do you want to save the changes you\'ve made to this file?',
      message: 'Your changes will be discarded otherwise.',
      buttons: {
        cancel: {
          label: 'Cancel',
          className: 'btn-default',
          callback: function () {}
        },
        dontSave: {
          label: 'Don\'t Save',
          className: 'btn-default',
          callback: function () {
            $('#editorsTab').find('.editor-tab-a').first().click();
            $('#editor-tab-' + n).remove();
            $('#editor-tab-pane-' + n).remove();
          }
        },
        save: {
          label: 'Save',
          className: 'btn-primary',
          callback: function () {
            saveEditor(ace.edit('editor-' + n), null, function () {
              $('#editorsTab').find('.editor-tab-a').first().click();
              $('#editor-tab-' + n).remove();
              $('#editor-tab-pane-' + n).remove();
            });
          }
        }
      }
    });
  } else {
    const $tab = $('#editor-tab-' + n),
      prevTab = $tab.prev();

    $tab.remove();
    $('#editor-tab-pane-' + n).remove();
    if (prevTab && $('a', prevTab).attr('href') !== '#') {
      $('a', prevTab).click();
    }
  }
}

export function newEditor(basename, fullpath, content) {
  const editor = addEditor(),
    $last = $('#editorsTab').find('li:nth-last-child(2)');

  $last.find('.name').text(basename);
  $last.find('a').attr('data-filename', fullpath);
  editor.getSession().setValue(content);

  return editor;
}

export function openFile(pathname, isDir) {
  const $editorsTab  = $('#editorsTab'),
    $path = $editorsTab.find('a[data-filename="' + pathname + '"]');

  // if file is already open, then just switch to it
  if ($path.length) {
    $path.click();
  } else if (isDir) {
    return setDirectory(pathname);
  } else {
    return send('file-get', pathname).then(function (result) {
      newEditor(result.basename, result.pathname, result.content);

      // [+] tab is always the last tab, so we'll activate the 2nd to last tab
      $('#editorsTab').find('li:nth-last-child(2) a').click();

      // set to not modified -- NOT IDEAL but it works :)
      setTimeout(function () {
        const id = $('#editors').find('.editor').last().attr('id');

        $('#' + id.replace('editor', 'editor-tab') + ' .unsaved').addClass('hide');
      }, 50);
    });
  }
}

/**
 * @param {string} id
 * @returns {Function}
 */
function handleAfterSaveEditor(id) {
  return function () {
    $('#' + id.replace('editor', 'editor-tab') + ' .unsaved').addClass('hide');

    return setDirectory();
  };
}

/**
 * @param {string} str
 * @returns {boolean}
 */
function hasFileExtension(str) {
  return /\.[A-Za-z0-9]{1,5}$/.test(str);
}


/**
 * @param {string} path
 * @returns {string}
 */
function getPathBasename(path) {
  return path.split(/[\\/]/).pop();
}

/**
 * @param {*} editor
 * @param {boolean} [saveAs]
 * @returns {Promise}
 */
export function saveEditor(editor, saveAs) {
  saveAs = saveAs || false;
  const $editorsTab = $('#editorsTab'),
    $activeLink = $editorsTab.find('.active a'),
    id = $($activeLink.attr('href') + ' .editor').attr('id'),
    dataFilename = $activeLink.attr('data-filename');
  let content;

  if (!editor) {
    editor = ace.edit(id);
  }

  content = editor.getSession().getValue();

  if (!dataFilename || saveAs === true) {
    return send('save_dialog', {
      title: 'Save File',
      default_path: store.get('workingDirectory')
    }).then(function (destfile) {
      if (!destfile) {
        return;
      }

      const $editorsTab = $('#editorsTab'),
        $activeLink = $editorsTab.find('.active a'),
        $name = $activeLink.find('.name');

      if (!hasFileExtension(destfile)) {
        destfile = destfile + '.py';
      }

      $name.text(getPathBasename(destfile));
      $activeLink.attr('data-filename', destfile);

      return saveFile(destfile, content)
        .then(handleAfterSaveEditor(id));
    });
  } else {
    return saveFile(dataFilename, content)
      .then(handleAfterSaveEditor(id));
  }
}

export function openDialog() {
  return send('open_dialog', {
    title: 'Select a file to open',
    defaultPath: store.get('workingDirectory'),
    properties: ['openFile']
  }).then(function (filenames) {
    if (filenames && filenames.length > 0) {
      return openFile(filenames[0]);
    }
  });
}
