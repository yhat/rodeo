import _ from 'lodash';
import shallowEqual from './shallow-equal';

/**
 * @param {ReactComponent} instance
 * @param {object} newProps
 * @param {object} [newState]
 * @returns {boolean}  True if new props and state are the same as the old
 * @see https://facebook.github.io/react/docs/shallow-compare.html
 * @see https://github.com/garbles/shallow-compare-without-functions/
 */
function shallowCompare(instance, newProps, newState) {
  if (newProps && newProps.children) {
    // Always update if the parent is updating, because we don't know about our children's state.
    //   To fix this, we need immutable.js
    return false;
  }

  return shallowEqual(instance.props, newProps, _.isFunction) &&
    shallowEqual(instance.state, newState, _.isFunction);
}

export default {
  shallowCompare
};
