/* globals store, ipc, templates */
'use strict';

/**
 * @param {string} dir
 * @returns {Promise}
 */
function setFiles(dir) {
  const facts = store.get('systemFacts'),
    homedir = facts.homedir,
    $fileList = $('#file-list'),
    $workingDirectory = $('#working-directory'),
    displayDotFiles = store.get('displayDotFiles');

  if (!dir) {
    throw new TypeError('Missing first parameter');
  }

  function isDotFile(file) {
    return /\/\./.test(file.filename) || /^\./.test(file.filename);
  }

  return ipc.send('files', dir).then(function (results) {
    $fileList.children().remove();
    $workingDirectory.children().remove();
    $workingDirectory.append(templates['wd']({ dir: dir.replace(homedir, '~') }));
    $fileList.append(templates['file-item']({
      isDir: true,
      filename: formatFilename(pathJoin([dir, '..'])),
      basename: '..'
    }));

    let directories = results.filter(function (file) { return file.isDirectory; }),
      files = results.filter(function (file) { return !file.isDirectory; }),
      sortedResults = directories.concat(files);

    if (displayDotFiles === false) {
      sortedResults = sortedResults.filter(isDotFile);
    }

    return sortedResults;
  }).then(function (results) {
    results.forEach(function (file) {
      $fileList.append(templates['file-item']({
        isDir: file.isDirectory,
        filename: file.filename,
        basename: file.basename
      }));
    });
  });
}
