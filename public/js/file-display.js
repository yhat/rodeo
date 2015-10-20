// TODO: ??? USER_HOME
USER_HOME = "/Users/glamp"

function setFiles(dir) {
  function callback(dir, files) {
    $("#file-list").children().remove();
    $("#working-directory").children().remove();
    $("#working-directory").append(wd_template({
      dir: dir.replace(USER_HOME, "~")
    }));
    $("#file-list").append(file_template({
      isDir: true,
      filename: formatFilename(pathJoin([dir, '..'])),
      basename: '..'
    }));

    getRC(function(rc) {
      files.forEach(function(f) {
        var filename = formatFilename(pathJoin([dir, f.basename]));
        if (! f.isDir) {
          return;
        }
        if (rc.displayDotFiles!=true) {
          if (/\/\./.test(dir) || /^\./.test(f.filename)) {
            // essa dotfile so we're going to skip it
            return;
          }
        }
        $("#file-list").append(file_template({
          isDir: f.isDir,
          filename: filename,
          basename: f.basename
        }));
      }.bind(this));

      files.forEach(function(f) {
        var filename = formatFilename(pathJoin([dir, f.basename]));
        if (f.isDir) {
          return;
        }
        if (rc.displayDotFiles!=true) {
          if (/\/\./.test(dir) || /^\./.test(f)) {
            // essa dotfile so we're going to skip it
            return;
          }
        }
        $("#file-list").append(file_template({
          isDir: f.isDir,
          filename: filename,
          basename: f.basename
        }));
      }.bind(this));
    });
  }
  if (isDesktop()) {
    dir = ipc.sendSync('wd-get');
    var files = ipc.sendSync('files', { "dir": dir });
    callback(dir, files);
  } else {
    getWorkingDirectory(function(wd) {
      dir = wd;
      $.get('files', { "dir": dir }, function(resp) {
        callback(dir, resp.files);
      });
    });
  }
}

getWorkingDirectory(function(wd) {
  setFiles(wd);
});
