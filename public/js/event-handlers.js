var scheme = window.location.protocol;

var wsScheme;
if (scheme == "https:") {
  wsScheme = "wss://";
} else {
  wsScheme = "ws://";
}

var wsUrl = document.URL.replace(/https?:\/\//, wsScheme).replace("#", "");
var ws = new WebSocket(wsUrl);

ws.onopen = function() {
  ws.send(JSON.stringify({ msg: 'index-files'}));
}

ws.onmessage = function(evt) {
  var data = JSON.parse(evt.data);

  if (data.msg=="refresh-variables") {
    refreshVariables();
  } else if (data.msg=="refresh-packages") {
    refreshPackages();
  } else if (data.msg=="set-working-directory") {
    setFiles(data.wd);
  } else if (data.msg=="file-index-start") {
    fileIndexStart();
  } else if (data.msg=="index-file") {
    indexFile(data);
  } else if (data.msg=="file-index-update") {
    fileIndexUpdate(data);
  } else if (data.msg=="file-index-interrupt") {
    fileIndexInterrupt();
  } else if (data.msg=="file-index-complete") {
    fileIndexComplete();
  }
};
