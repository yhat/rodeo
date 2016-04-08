'use strict';

const _ = require('lodash');

/**
 * Select rules whose `when` returns truthy
 * @param {[{when: function, then: function}]} ruleSet
 * @returns {[{when: function, then: function}]}  new RuleSet
 */
function select(ruleSet) {
  const selected = [];

  for (let i = 0; i < ruleSet.length; i++) {
    const rule = ruleSet[i],
      when = rule.when;

    if (when.apply(null, _.slice(arguments, 1))) {
      selected.push(rule);
    }
  }

  return selected;
}

/**
 * Execute the `then` of the first rule whose `when` returns truthy
 * @param {[{when: function, then: function}]} ruleSet
 * @returns {*}  Result of first good rule
 */
function apply(ruleSet) {
  for (let i = 0; i < ruleSet.length; i++) {
    const rule = ruleSet[i],
      when = rule.when,
      then = rule.then;

    if (when.apply(null, _.slice(arguments, 1))) {
      return then.apply(null, _.slice(arguments, 1));
    }
  }
}

module.exports.select = select;
module.exports.apply = apply;