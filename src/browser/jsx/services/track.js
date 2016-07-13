import _ from 'lodash';
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

function getRandomCharacters(size) {
  let str = '';

  while (str.length < size) {
    let sub = Math.floor((Math.random() * (Number.MAX_SAFE_INTEGER / 36 * 10))).toString(36);

    str += sub.substr(1); // remove the first character, which is less random than the others
  }

  // cut down to the exact size
  return str.substr(Math.max(str.length - size, 0));
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
 * @param {string} [label]
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
    let url,
      metrics = _.pickBy({
        an: appName,
        av: appVersion,
        cid: userId,
        ec: eventCategory,
        ea: eventAction,
        r: getRandomCharacters(20) // bust any caches between us and the metrics server
      }, _.identity);

    if (label) {
      if (typeof label === 'object') {
        try {
          metrics.blob = JSON.stringify(label);
        } catch (ex) {
          metrics.blob = '{"error": "Unable to stringify object"}';
        }
      } else {
        metrics.el = label;
      }
    }

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
