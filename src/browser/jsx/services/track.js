import systemFacts from './system-facts';

const appName = 'Rodeo',
  metricsUrl = 'http://rodeo-analytics.yhathq.com/?',
  errorMessage = 'Usage Metrics Error',
  successMessage = 'Thank you for using Rodeo! We use metrics to see how well we are doing. We could use these metrics to' +
    'justify new features or internationalization. To disable usage metrics, change the setting in the preferences menu.';

function serialize(obj) {
  const str = [];

  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  return str.join('&');
}

/**
 * @param {object} metrics
 */
function reportSuccess(metrics) {
  console.log(successMessage, metrics);
}

/**
 * @param {Error} error
 */
function reportError(error) {
  console.error(errorMessage, error);
}

/**
 * @param {string} eventCategory
 * @param {string} eventAction  subcategory
 * @param {string} label
 * @returns {Promise}
 */
export default function track(eventCategory, eventAction, label) {
  return Promise.all([
    systemFacts.getUserId(),
    systemFacts.getSystemFacts()
  ]).then(function (results) {
    let userId = results[0],
      facts = results[1],
      metrics = {
        an: appName,
        av: facts.appVersion,
        cid: userId,
        ec: eventCategory,
        ea: eventAction,
        el: label
      },
      url = metricsUrl + serialize(metrics);

    if (navigator.onLine === true) {
      const request = new XMLHttpRequest();

      request.open('GET', url, true);
      request.onload = function () {
        if (!(request.status >= 200 && request.status < 400)) {
          reportError(new Error('HTTP ' + request.status));
        } else {
          reportSuccess(metrics);
        }
      };
      request.send();
    }
  }).catch(reportError);
}
