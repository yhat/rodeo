import _ from 'lodash';
import {local} from './store';
import clientDiscovery from './client-discovery';
import bluebird from 'bluebird';

const appName = 'Rodeo',
  optOutMessage = 'Usage/Metric tracking is disabled.',
  errorMessage = 'Usage Metrics Error',
  successMessage = 'Thank you for using Rodeo! We use metrics to see how well we are doing. We could use these metrics to ' +
    'justify new features or internationalization. To disable usage metrics, change the setting in the preferences menu.',
  allowedEventProperties = ['category', 'action', 'label', 'value', 'hitType', 'force'],
  eventCharacterLimits = {
    category: 150,
    action: 500,
    label: 250
  };

let trackGA, trackPiwik;

/**
 * @typedef {object} TrackingEvent
 * @property {string} category
 * @property {string} action
 * @property {string} [label]
 * @property {*} [value]
 * @property {boolean} [force=false]
 */

/**
 * @typedef {object} TrackingLocals
 * @property {string} userId
 * @property {string} appName
 * @property {string} appVersion
 * @property {string} cacheBust
 */

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
 * If target exists and is a string, and if it is longer than limit, cut it off at the limit
 * @param {object} obj
 * @param {string} target
 * @param {number} limit
 */
function limitStringLength(obj, target, limit) {
  if (_.isString(obj[target]) && obj[target].length > limit) {
    obj[target] = obj[target].substr(0, limit);
  }
}

/**
 * If target exists but is not what is wanted, remove it from object
 * @param {object} obj
 * @param {string} target
 * @param {function} filterFn
 */
function cleanPropertyForType(obj, target, filterFn) {
  if (obj[target] && !filterFn(obj[target])) {
    delete obj[target];
  }
}

/**
 * Ensure property is in list, or replace it with defaultValue or delete the property
 * @param {object} obj
 * @param {string} target
 * @param {[string]} enumList
 * @param {*} [defaultValue]
 */
function cleanPropertyByEnum(obj, target, enumList, defaultValue) {
  if (!_.includes(enumList, obj[target])) {
    if (defaultValue !== undefined) {
      obj[target] = defaultValue;
    } else {
      delete obj[target];
    }
  }
}

/**
 * @param {Error} error
 */
function reportError(error) {
  console.error(errorMessage, error);
}

/**
 *
 * @param {string} metricsUrl
 * @param {object} metrics
 * @returns {Promise}
 */
function send(metricsUrl, metrics) {
  return new Promise(function (resolve, reject) {
    const url = metricsUrl + '?' + serialize(metrics);

    if (navigator.onLine === true) {
      const request = new XMLHttpRequest();

      request.open('GET', url, true);
      request.onload = function () {
        if (!(request.status >= 200 && request.status < 400)) {
          reject(new Error('HTTP ' + request.status));
        } else {
          console.log(successMessage, metrics);
          resolve();
        }
      };
      request.send();
    } else {
      resolve();
    }
  });
}

trackPiwik = (function () {
  const piwikApiVersion = 1,
    idSite = 1,
    mockUrl = 'http://rodeo.yhat.com',
    metricsUrl = 'http://lasso.s.yhat.com/piwik.php';

  /**
   * @param {TrackingEvent} event
   * @param {TrackingLocals} locals
   * @returns {Promise}
   */
  return function (event, locals) {
    const actionName = _.filter([event.category, event.action, event.label], _.identity).join('/');
    let metrics = _.pickBy({
      rec: piwikApiVersion,
      idsite: idSite,
      url: mockUrl,
      action_name: actionName,
      _id: locals.userId,
      rand: locals.cacheBust,
      apiv: piwikApiVersion,
      e_c: event.category,
      e_a: event.action,
      e_n: event.label,
      e_v: event.value,
      _cvar: JSON.stringify({
        1: ['appName', locals.appName],
        2: ['appVersion', locals.appVersion]
      })
    }, _.identity);

    return send(metricsUrl, metrics);
  };
}());

trackGA = (function () {
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
    gaApiVersion = 1,
    trackingId = 'UA-37140626-2',
    metricsUrl = 'https://ssl.google-analytics.com/collect';

  /**
   * @param {TrackingEvent} event
   * @param {TrackingLocals} locals
   * @returns {Promise}
   */
  return function (event, locals) {
    if (!locals.isTracking) {
      // if tracking is off, we obviously won't be reporting the end of a session, so also don't report the start
      delete event.sessionControl;
    }

    cleanPropertyByEnum(event, 'sessionControl', sessionControls);
    cleanPropertyByEnum(event, 'hitType', hitTypes, 'event');

    let metrics = _.pickBy({
      v: gaApiVersion,
      an: appName,
      av: locals.appVersion,
      t: event.hitType,
      tid: trackingId,
      cid: locals.userId,
      cd1: locals.userId,
      cd2: new Date().getTime(),
      ec: event.category,
      ea: event.action,
      el: event.label,
      ev: event.value,
      sc: event.sessionControl,
      z: locals.cacheBust // bust any caches between us and the metrics server
    }, _.identity);

    return send(metricsUrl, metrics);
  };
}());

/**
 * @param {TrackingEvent} event
 * @returns {Promise}
 */
export default function track(event) {
  event = _.pick(event, allowedEventProperties);
  const isTracking = !(local.get('trackMetrics') === false);

  limitStringLength(event, 'category', eventCharacterLimits.category);
  limitStringLength(event, 'action', eventCharacterLimits.action);
  limitStringLength(event, 'label', eventCharacterLimits.label);
  cleanPropertyForType(event, 'value', _.isInteger);
  cleanPropertyForType(event, 'force', _.isBoolean);

  if (local.get('trackMetrics') === false && event.force !== true) {
    console.log(optOutMessage);
    return;
  }

  return bluebird.all([
    clientDiscovery.getUserId(),
    clientDiscovery.getAppVersion()
  ]).spread(function (userId, appVersion) {
    const cacheBust = getRandomCharacters(20),
      locals = {userId, appName, appVersion, cacheBust, isTracking};

    return bluebird.join(
      trackGA(event, locals).catch(reportError),
      trackPiwik(event, locals).catch(reportError)
    );
  });
}
