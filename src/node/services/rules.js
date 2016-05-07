'use strict';

const _ = require('lodash');

/**
 * @param {object} rule
 * @param {Array} args
 * @returns {boolean}
 */
function checkWhen(rule, args) {
  const when = rule.when;

  switch (typeof when) {
    case 'function': return !!when.apply(null, args);
    case 'boolean': return when;
    default: return false;
  }
}

/**
 * @param {object} rule
 * @param {Array} args
 * @returns {*}
 */
function returnThen(rule, args) {
  const then = rule.then;

  switch (typeof then) {
    case 'function': return then.apply(null, args);
    default: return then;
  }
}

/**
 * Select rules whose `when` returns truthy
 * @param {[{when: function, then: function}]} ruleSet
 * @returns {[{when: function, then: function}]}  new RuleSet
 */
function select(ruleSet) {
  const selected = [];

  for (let i = 0; i < ruleSet.length; i++) {
    const rule = ruleSet[i],
      args = _.slice(arguments, 1);

    if (checkWhen(rule, args)) {
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
function first(ruleSet) {
  for (let i = 0; i < ruleSet.length; i++) {
    const rule = ruleSet[i],
      args = _.slice(arguments, 1);

    if (checkWhen(rule, args)) {
      return returnThen(rule, args);
    }
  }
}

/**
 * Return the results of all that pass
 * @param {Array} ruleSet
 * @returns {Array}
 */
function all(ruleSet) {
  let result = [];

  for (let i = 0; i < ruleSet.length; i++) {
    const rule = ruleSet[i],
      args = _.slice(arguments, 1);

    if (checkWhen(rule, args)) {
      result.push(returnThen(rule, args));
    }
  }

  return result;
}

module.exports.select = select;
module.exports.first = first;
module.exports.all = all;
