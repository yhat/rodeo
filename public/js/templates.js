// Tab stuff
$("#add-tab").click(function(e) {
  e.preventDefault();
  addEditor();
  return false;
});

function track(cat, action, label, value) {
  const userId = store.get('userId'),
    version = store.get('version');

  var data = {
    an: 'Rodeo',          // app name
    av: version,       // app version
    cid: userId,           // user id
    ec: cat,              // event category
    ea: action,           // event action
    el: label             // event label
  };

  var url = 'http://rodeo-analytics.yhathq.com/?' + serialize(data);

  if (navigator.onLine === true) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        // good to go
        // console.log("metric tracked!");
      } else {
        console.error('error with metrics');
      }
    };
    request.send();
  }
}

// things that need a place

function serialize(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}


// tell server if we're online or offline
var updateOnlineStatus = function () {
  console.log(navigator.onLine ? 'online' : 'offline');
};
// send subsequent changes to status
window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline',  updateOnlineStatus);
