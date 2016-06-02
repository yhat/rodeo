import _ from 'lodash';
import bluebird from 'bluebird';
import {send} from './ipc';
import * as store from './store';
import validation from './validation';
import clientDiscovery from './client-discovery';

let validators = {
  isPathReal: value => send('resolveFilePath', value)
    .then(expandedFilename => send('fileStats', expandedFilename)),
  isPython: value => clientDiscovery.checkKernel({cmd: value}),
  isFontSize: validation.isFontSize,
  isTabSpace: validation.isTabSpace
};

/**
 * @param {object} item
 * @param {Array} item.valid  List of validators by key
 * @param {string} value
 * @returns {Promise<boolean>}
 */
function isValid(item, value) {
  if (!item.valid) {
    return bluebird.resolve(true);
  }

  return bluebird.all(_.map(item.valid, function (key) {
    let validator = validators[key];

    if (validator) {
      return validators[key](value);
    }

    return bluebird.reject(new Error('Validator' + key + 'does not exist'));
  })).timeout(2000);
}

/**
 * Convert the preferences definition (from the yaml file) into something that has all the information needed to render.
 * @param {Array} definition
 * @param {object} explanations
 * @returns {Array}
 */
function define(definition, explanations) {
  return _.map(definition, function (preferenceGroup, index) {
    const id = _.kebabCase(preferenceGroup.label) + '-' + index;

    let items = _.map(preferenceGroup.items, function (preference) {
      const item = _.clone(preference),
        explanation = explanations[preference.explanation],
        storeValue = store.get(preference.key),
        defaultValue = storeValue !== null ? storeValue : preference.defaultValue;

      if (explanation) {
        item.explanation = explanation;
      } else {
        delete item.explanation;
      }

      if (defaultValue !== undefined) {
        item.defaultValue = defaultValue;
      } else {
        delete item.defaultValue;
      }

      return item;
    });

    return _.defaults({id, items}, preferenceGroup);
  });
}

export default {
  isValid,
  define
};
