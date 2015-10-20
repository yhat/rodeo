function setFiles(dir) {
  function callback(home, dir, files) {
    $("#file-list").children().remove();
    $("#working-directory").children().remove();
    $("#working-directory").append(wd_template({
      dir: dir.replace(home, "~")
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
    if (dir==null) {
      dir = ipc.sendSync('wd-get');
    }
    var resp = ipc.sendSync('files', { "dir": dir });
    callback(resp.home, resp.dir, resp.files);
  } else {
    getWorkingDirectory(function(wd) {
      if (dir==null) {
        dir = wd;
      }
      $.get('files', { "dir": dir }, function(resp) {
        callback(resp.home, resp.dir, resp.files);
      });
    });
  }
}

getWorkingDirectory(function(wd) {
  setFiles(wd);
});
