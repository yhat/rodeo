import _ from 'lodash';

function equal(a, b) {
  if (a === b || (!a && !b)) {
    return true;
  }

  const aKeys = Object.keys(a),
    bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i],
      aValue = a[key],
      // the 'children' key doesn't matter; it's not in our control
      isChildren = key === 'children',
      // functions don't matter either
      isFunction = typeof aValue === 'function',
      isValueEqual = aValue === b[key];

    if (!isChildren && !isFunction && !isValueEqual) {
      return false;
    }
  }

  return true;
}

/**
 * @param {ReactComponent} instance
 * @param {object} newProps
 * @param {object} [newState]
 * @returns {boolean}  True if new props and state are the same as the old
 * @see https://facebook.github.io/react/docs/shallow-compare.html
 * @see https://github.com/garbles/shallow-compare-without-functions/
 */
function shallowEqual(instance, newProps, newState) {
  return equal(instance.props, newProps) && equal(instance.state, newState);
}

function getClassNameList(instance) {
  const displayName = instance.constructor.displayName,
    props = instance.props,
    className = [_.kebabCase(displayName)];

  if (props.className) {
    className.push(props.className);
  }

  console.log(displayName, 'render', props);

  return className;
}

function shouldComponentUpdate(instance, newProps, newState) {
  const result = !shallowEqual(instance, newProps, newState);

  console.log(instance.constructor.displayName, 'shouldComponentUpdate', result);

  return result;
}

export default {
  shallowEqual,
  getClassNameList,
  shouldComponentUpdate
};
