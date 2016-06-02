import store from './store';
import clientDiscovery from './client-discovery';
import bluebird from 'bluebird';

const appName = 'Rodeo',
  metricsUrl = 'http://rodeo-analytics.yhathq.com/?',
  optOutMessage = 'Usage/Metric tracking is disabled.',
  errorMessage = 'Usage Metrics Error',
  successMessage = 'Thank you for using Rodeo! We use metrics to see how well we are doing. We could use these metrics to' +
    'justify new features or internationalization. To disable usage metrics, change the setting in the preferences menu.';

/**
 * @param {object} obj
 * @returns {string}
 */
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

function reportOptOut() {
  console.log(optOutMessage);
}

/**
 * @param {string} eventCategory
 * @param {string} eventAction  subcategory
 * @param {string} label
 * @returns {Promise}
 */
export default function track(eventCategory, eventAction, label) {
  if (store.get('trackMetrics') === false) {
    return reportOptOut();
  }

  return bluebird.all([
    clientDiscovery.getUserId(),
    clientDiscovery.getAppVersion()
  ]).spread(function (userId, appVersion) {
    let metrics = {
        an: appName,
        av: appVersion,
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
