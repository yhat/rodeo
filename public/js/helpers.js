function isDesktop() {
  return /^file:\/\//.test(window.location.href);
}

function updateRC(preferenceName, preferenceValue) {
  if (isDesktop()) {
    return ipc.send("preferences-post", { name: preferenceName, value: preferenceValue });
  } else {
    $.post("preferences", { name: preferenceName, value: preferenceValue });
  }
}

function pathJoin(parts){
  // if windows, separator = '\\\\';
  var separator;
  if (navigator.platform == "Win32") {
    separator = '\\\\';
  } else {
    separator = '/';
  }
  var replace = new RegExp(separator+'{1,}', 'g');
  return parts.join(separator).replace(replace, separator);
}
