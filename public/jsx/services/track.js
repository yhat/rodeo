import * as store from './store';

function serialize(obj) {
  const str = [];

  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  return str.join('&');
}

// todo: why don't we use value?
export default function track(cat, action, label, value) {
  const userId = store.get('userId'),
    version = store.get('version'),
    url = 'http://rodeo-analytics.yhathq.com/?' + serialize({
      an: 'Rodeo',          // app name
      av: version,       // app version
      cid: userId,           // user id
      ec: cat,              // event category
      ea: action,           // event action
      el: label             // event label
    });

  if (navigator.onLine === true) {
    const request = new XMLHttpRequest();

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