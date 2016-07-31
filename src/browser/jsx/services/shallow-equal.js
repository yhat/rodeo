import _ from 'lodash';

/**
 * Compares the properties of object a to the properties of object b
 *
 *
 * @param {object} a
 * @param {object} b
 * @param {function} [filter]
 * @returns {boolean}
 * @example shallowCompare({a: 'a'}, {a: 'a'}); // true
 * @example shallowCompare({a: 'a'}, {a: 'b'}); // false
 * @example shallowCompare({a: 'a'}, {b: 'a'}); // false
 * @example shallowCompare({a: obj}, {a: obj}); // true, because shallow
 * @example shallowCompare({a: objA}, {a: _.clone(objA)}); // false, because shallow
 * @example shallowCompare({a: _constant('b')}, {a: _constant('b')}}); // false, because functions references
 * @example shallowCompare({a: _constant('b')}, {a: _constant('b')}}, _.isFunction); // true, ignoring functions
 */
export default function (a, b, filter) {
  filter = filter || _.noop;

  if (a === b) {
    return true;
  }

  return (
    _.every(a, (value, key) => filter(value) || value === b[key]) &&
    _.every(b, (value, key) => filter(value) || value === a[key])
  );
}

