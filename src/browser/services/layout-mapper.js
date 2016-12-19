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
 * @returns {Array}
 */
function define(definition) {
  return _.map(definition, function (preferenceGroup) {
    preferenceGroup = _.clone(preferenceGroup);
    preferenceGroup.items = _.reduce(preferenceGroup.items, function (list, preference) {
      const item = _.clone(preference),
        // remember: false is a valid value here
        storeValue = preference.key ? local.get(preference.key) : null;

      // filter item by platform
      if (_.isArray(item.platform) && !_.includes(item.platform, process.platform)) {
        return list;
      }

      // key from localStorage
      if (storeValue === null) {
        if (preference.value !== undefined) {
          item.value = preference.value;
        } else {
          // not allowed to be undefined, too confusing
          delete item.value;
        }
      } else {
        item.value = storeValue;
      }

      list.push(item);

      return list;
    }, []);

    return preferenceGroup;
  });
}

export default {
  validate,
  define
};
