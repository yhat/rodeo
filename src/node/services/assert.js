import _ from 'lodash';

function assert() {
  let assertions = _.toArray(arguments);

  assertions = _.map(assertions, assertionPair => {
    const assertion = assertionPair[0],
      message = assertionPair[1],
      type = typeof assertion;
    let error, assert;

    if (type === 'object') {
      assert = _.mapValues(assertion, value => _.isFunction(value) ? value : _.partial(_.isEqual, value));
      assert = _.conforms(assert);
      error = function (actual) {
        const assertionDefinition = _.mapValues(assertion, value => _.isFunction(value) ? value.name : value);

        throw new Error(JSON.stringify({message, actual, assertion: assertionDefinition}));
      };
    } else if (type === 'string') {
      assert = thing => typeof thing === assertion;
      error = function (actual) {
        throw new Error(JSON.stringify({message, actual, assertion}));
      };
    } else if (type === 'function') {
      assert = assertion;
      error = function (actual) {
        throw new Error(JSON.stringify({message, actual, assertion: assertion.name}));
      };
    } else {
      throw new Error('Invalid assertion pair' + JSON.stringify(assertionPair));
    }

    return [_.negate(assert), error];
  });

  return _.cond(assertions);
}

export default assert;
