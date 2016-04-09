'use strict';

const path = require('path'),
  walk = require('walk'),
  preferences = require('./preferences');

let walker;

module.exports = function (ws) {
  if (walker) {
    walker.pause();
  }

  let pref = preferences.getPreferences(),
    n = 0,
    wd = USER_WD;

  walker = walk.walk(USER_WD, { followLinks: false });

  // reindex file search
  walker = walk.walk(USER_WD, { followLinks: false });

  ws.sendJSON({ msg: 'file-index-start' });

  walker.on('file', function (root, stat, next) {

    // handles issue w/ extra files being emitted if you're indexing a large directory and
    // then cd into another directory
    if (wd != USER_WD) {
      return;
    }

    let dir = root.replace(USER_WD, '') || '',
      displayFilename = path.join(dir, stat.name).replace(/^\//, '');

    if (pref.displayDotFiles == true) {
      // do nothing
    } else {
      if (/^\./.test(path.basename(dir)) || /^\./.test(stat.name)) {
        // it's a dotfile so we're going to skip it
        return next();
      }
    }

    ws.sendJSON({ msg: 'index-file', fullFilename: path.join(root, stat.name), displayFilename: displayFilename });

    n++;
    if (n % 100 === 0) {
      ws.sendJSON({ msg: 'file-index-update', nComplete: n });
    }

    // stop if there are too many files
    if (n > 15000) {
      walker.pause();
      ws.sendJSON({ msg: 'file-index-interrupt' });
    }

    // we're going to throttle this so it doesn't take up too much CPU
    setTimeout(next, 5);
    // next();
  });

  walker.on('end', function () {
    ws.sendJSON({ msg: 'file-index-complete' });
  });
};
