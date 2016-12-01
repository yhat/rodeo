import _ from 'lodash';
import {local} from './store';
import clientDiscovery from './jupyter/client-discovery';
import bluebird from 'bluebird';
import textUtil from './text-util';

const appName = 'Rodeo',
  optOutMessage = 'Usage/Metric tracking is disabled.',
  errorMessage = 'Usage Metrics Error',
  successMessage = 'Thank you for using Rodeo! We use metrics to see how well we are doing. We could use these metrics to ' +
    'justify new features or internationalization. To disable usage metrics, change the setting in the preferences menu.',
  allowedEventProperties = ['category', 'action', 'label', 'value', 'hitType', 'force', 'sessionControl'],
  eventCharacterLimits = {
    category: 150,
    action: 500,
    label: 250
  };

let trackGA = createTrackGA({metricsUrl: 'https://ssl.google-analytics.com/collect'}),
  trackYhat = createTrackGA({metricsUrl: 'https://analytics.yhat.com/collect'});

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
 * If target exists and is a string, and if it is longer than limit, cut it off at the limit
 * @param {object} obj
 * @param {string} target
 * @param {number} limit
 */
function limitStringLength(obj, target, limit) {
  if (_.isObject(obj) && _.isString(obj[target]) && obj[target].length > limit) {
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
  return new bluebird(function (resolve, reject) {
    const url = metricsUrl + '?' + serialize(metrics);

    if (navigator.onLine === true) {
      const request = new XMLHttpRequest();

      request.open('GET', url, true);
      request.onload = function () {
        if (!(request.status >= 200 && request.status < 400)) {
          return reject(new Error('HTTP ' + request.status));
        }

        resolve();
      };
      request.send();
    } else {
      resolve();
    }
  });
}

function createTrackGA(options) {
  const hitTypes = ['pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'],
    sessionControls = ['start', 'end'],
    gaApiVersion = 1,
    trackingId = 'UA-37140626-2';

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
      an: __APP_NAME__,
      av: __VERSION__,
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

    return send(options.metricsUrl, metrics);
  };
}

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
    return console.log(optOutMessage);
  }

  console.log(successMessage, event);

  return bluebird.all([
    clientDiscovery.getUserId()
  ]).spread(function (userId) {
    const cacheBust = textUtil.getRandomCharacters(20),
      locals = {userId, appName, cacheBust, isTracking};

    return bluebird.join(
      trackGA(event, locals).catch(reportError),
      trackYhat(event, locals).catch(reportError)
    );
  });
}
