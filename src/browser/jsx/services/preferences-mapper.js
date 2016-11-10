import _ from 'lodash';
import bluebird from 'bluebird';
import {local} from './store';
import validation from './validation';

const validationTimeout = 60000;

/**
 * @param {object} item
 * @param {Array} item.valid  List of validators by key
 * @param {string} value
 * @returns {Promise<[Error]>}
 */
function validate(item, value) {
  if (!item.valid) {
    return bluebird.resolve([]);
  }
  const promises = _.map(item.valid, key => bluebird.try(function () {
    let validator = validation[key];

    if (!validator) {
      throw new Error('Validator' + key + 'does not exist');
    }

    return validator(value);
  }).reflect());

  return bluebird.all(promises)
    .timeout(validationTimeout)
    // only return list of errors
    .then(function (inspections) {
      const list = _.map(inspections, inspection => inspection.isFulfilled() ? inspection.value() : inspection.reason());

      return _.filter(_.flattenDeep(list), _.isError);
    });
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
        storeValue = preference.key && local.get(preference.key) || null;

      if (storeValue === null) {
        if (preference.value !== undefined) {
          item.value = preference.value;
        } else {
          delete item.value;
        }
      } else {
        item.value = storeValue;
      }

      if (explanation) {
        item.explanation = explanation;
      } else {
        delete item.explanation;
      }

      return item;
    });

    return _.defaults({id, items}, preferenceGroup);
  });
}

export default {
  validate,
  define
};
