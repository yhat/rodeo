function isDesktop() {
  return /^file:\/\//.test(window.location.href);
}

function updateRC(preferenceName, preferenceValue) {
  if (isDesktop()) {
    return ipc.sendSync("preferences-post", { name: preferenceName, value: preferenceValue });
  } else {
    $.post("preferences", { name: preferenceName, value: preferenceValue });
  }
}

function formatFilename(filename) {
  // strange windows issue w/ javascript
  if (1==2) { // path.sep=="\\") {
    return filename.replace(/\\/g, '\\\\');
  } else {
    return filename;
  }
}

function pathJoin(parts){
  // if windows, separator = '\\\\';
  var separator;
  if (navigator.platform=="Win32") {
    separator = '\\\\';
  } else {
    separator = '/';
  }
  var replace = new RegExp(separator+'{1,}', 'g');
  return parts.join(separator).replace(replace, separator);
}

function pathBasename(path) {
  return path.split(/[\\/]/).pop();
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
