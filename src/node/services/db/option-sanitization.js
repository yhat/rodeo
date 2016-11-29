import _ from 'lodash';
const log = require('../log').asInternal(__filename);

function normalize(value, definition) {
  if (_.isArray(definition.normalization)) {
    value = _.reduce(definition.normalization, (value, rule) => rule(value), value);
  }

  return value;
}

function validate(value, definition) {
  if (!_.isArray(definition.validation)) {
    return [];
  }

  return _.filter(definition.validation, rule => {
    try {
      return !rule[0](value);
    } catch (ex) {
      return false;
    }
  });
}

function sanitize(options, definitions) {
  return _.reduce(definitions, (obj, definition) => {
    let name = definition.name,
      option = options[name];

    if (option === undefined) {
      if (definition.required) {
        throw new Error(`Option ${name} is required`);
      } else if (definition.default !== undefined) {
        obj[name] = definition.default;
      }
    } else {
      option = normalize(option, definition);
      let invalidRules = validate(option, definition);

      if (invalidRules.length) {
        let errorMessage = _.map(invalidRules, rule => rule[1]).join('; ');

        throw new Error([name, errorMessage].join(' '));
      }

      obj[name] = option;
    }

    return obj;
  }, {});
}

module.exports.sanitize = sanitize;
