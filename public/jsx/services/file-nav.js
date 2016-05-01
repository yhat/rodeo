import * as store from './store';
import {send} from './ipc';
import templates from 'templates';
import $ from 'jquery';


function isDotFile(file) {
  return /\/\./.test(file.filename) || /^\./.test(file.filename);
}

function sort(results) {
  let displayDotFiles = store.get('displayDotFiles'),
    directories = results.filter(function (file) {
      return file.isDirectory;
    }),
    files = results.filter(function (file) {
      return !file.isDirectory;
    }),
    sortedResults = directories.concat(files);

  if (displayDotFiles === false) {
    sortedResults = sortedResults.filter(isDotFile);
  }

  return sortedResults;
}

/**
 * @param {[{isDirectory: boolean, filename: string, path: string}]} results
 */
function updateFileListView(results) {
  const $fileList = $('#file-list');

  $fileList.children().remove();

  $fileList.append(templates['file-item']({
    isDir: true,
    basename: '..'
  }));

  results.forEach(function (file) {
    $fileList.append(templates['file-item']({
      isDir: file.isDirectory,
      filename: file.filename,
      basename: file.basename
    }));
  });
}

/**
 * @param {string} currentDirectory
 * @param {string} homeDirectory
 */
function updateWorkingDirectoryView(currentDirectory, homeDirectory) {
  const $workingDirectory = $('#working-directory');

  $workingDirectory.children().remove();
  $workingDirectory.append(templates['wd']({dir: currentDirectory.replace(homeDirectory, '~')}));
}

/**
 * @param {string} currentDirectory
 * @param {string} homeDirectory
 * @returns {function}
 */
function updateView(currentDirectory, homeDirectory) {
  return function (results) {
    updateWorkingDirectoryView(currentDirectory, homeDirectory);

    results = sort(results);
    updateFileListView(results);
  };
}

/**
 * @param {string} dir
 * @returns {Promise}
 */
export function setDirectory(dir) {
  return new Promise(function (resolve) {
    const facts = store.get('systemFacts'),
      homeDirectory = facts && facts.homedir;
    let promise;

    if (!dir || typeof dir !== 'string') {
      throw new TypeError('Bad first parameter: ' + dir);
    }

    promise = send('files', dir)
      .then(updateView(dir, homeDirectory));

    resolve(promise);
  });
}

export function goToDefaultDirectory() {
  const workingDirectory = store.get('workingDirectory'),
    facts = store.get('systemFacts'),
    homeDirectory = facts && facts.homedir,
    defaultDirectory = workingDirectory || homeDirectory;

  return setDirectory(defaultDirectory);
}
