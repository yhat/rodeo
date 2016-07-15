import _ from 'lodash';
import {local} from './store';
import clientDiscovery from './client-discovery';
import bluebird from 'bluebird';

const hitTypes = [
    'pageview',
    'screenview',
    'event',
    'transaction',
    'item',
    'social',
    'exception',
    'timing'
  ],
  sessionControls = [
    'start',
    'end'
  ],
  apiVersion = 1,
  isAnonymized = 1,
  eventLabelMax = 250,
  appName = 'Rodeo',
  trackingId = 'UA-37140626-2',
  metricsUrl = 'https://ssl.google-analytics.com/collect?',
  optOutMessage = 'Usage/Metric tracking is disabled.',
  errorMessage = 'Usage Metrics Error',
  successMessage = 'Thank you for using Rodeo! We use metrics to see how well we are doing. We could use these metrics to ' +
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
 * @param {number} size
 * @returns {string}
 */
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
 * @param {object} event
 * @param {string} event.category
 * @param {string} event.action
 * @param {string} [event.label]
 * @param {*} [event.value]
 * @param {boolean} [event.force=false]
 * @returns {Promise}
 */
export default function track(event) {
  event = _.pick(event, ['category', 'action', 'label', 'value']);

  if (local.get('trackMetrics') === false && event.force !== true) {
    if (event.force !== true) {
      return reportOptOut();
    } else {
      // if tracking is off, we obviously won't be reporting the end of a session, so also don't report the start
      delete event.sessionControl;
    }
  }

  const documentLocation = document.location.origin + document.location.pathname + document.location.search;

  // event label size is limited
  if (event.label && event.label.length > eventLabelMax) {
    event.label = event.label.substr(0, eventLabelMax);
  }

  // event value must be an integer!
  if (event.value && !_.isInteger(event.value)) {
    delete event.value;
  }

  if (!_.includes(sessionControls, event.sessionControl)) {
    delete event.sessionControl;
  }

  // only certain hit types are allowed
  event.hitType = _.includes(hitTypes, event.hitType) ? event.hitType : 'event';

  return bluebird.all([
    clientDiscovery.getUserId(),
    clientDiscovery.getAppVersion()
  ]).spread(function (userId, appVersion) {
    let url,
      metrics = _.pickBy({
        v: apiVersion,
        aip: isAnonymized,
        an: appName,
        av: appVersion,
        t: event.hitType,
        tid: trackingId,
        dl: documentLocation,
        cid: userId,
        ec: event.category,
        ea: event.action,
        el: event.label,
        ev: event.value,
        sc: event.sessionControl,
        z: getRandomCharacters(20) // bust any caches between us and the metrics server
      }, _.identity);

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
