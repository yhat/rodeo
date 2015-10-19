// TODO: ??? USER_HOME
USER_HOME = "/Users/glamp"

function setFiles(dir) {
  $.get('files', { "dir": dir }, function(resp) {
    var files = resp.files;
    $("#file-list").children().remove();
    $("#working-directory").children().remove();
    $("#working-directory").append(wd_template({
      dir: resp.dir.replace(USER_HOME, "~")
    }));
    $("#file-list").append(file_template({
      isDir: true,
      filename: formatFilename(pathJoin([dir, '..'])),
      basename: '..'
    }));

    $.get("preferences", function(rc) {
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
  });
}
