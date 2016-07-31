/* globals describe, it, expect, jest */

jest.unmock('../../src/browser/jsx/services/shallow-equal');
import _ from 'lodash';
import fn from '../../src/browser/jsx/services/shallow-equal';

describe(__filename, function () {
  it('is true for equal objects', function () {
    expect(fn({a: 'a'}, {a: 'a'})).toEqual(true);
  });

  it('is false for unequal values', function () {
    expect(fn({a: 'a'}, {a: 'b'})).toEqual(false);
  });

  it('is true for unequal keys', function () {
    expect(fn({a: 'a'}, {b: 'a'})).toEqual(false);
  });

  it('is true because same object reference', function () {
    const obj = {b: 'c'};

    expect(fn({a: obj}, {a: obj})).toEqual(true);
  });

  it('is false when removing a property', function () {
    expect(fn({a: 'a'}, {})).toEqual(false);
  });

  it('is false when adding a property', function () {
    expect(fn({}, {a: 'a'})).toEqual(false);
  });

  it('is false because different object reference', function () {
    const objA = {b: 'c'};

    expect(fn({a: objA}, {a: _.clone(objA)})).toEqual(false);
  });

  it('is false, because functions references', function () {
    expect(fn({a: _.constant('b')}, {a: _.constant('b')})).toEqual(false);
  });

  it('is true, ignoring filter on both', function () {
    expect(fn({a: _.constant('b')}, {a: _.constant('b')}, _.isFunction)).toEqual(true);
  });
});
