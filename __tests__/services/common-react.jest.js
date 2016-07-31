/* globals describe, it, expect, jest */

jest.unmock('../../src/browser/jsx/services/common-react');
jest.unmock('../../src/browser/jsx/services/shallow-equal');
import _ from 'lodash';
import lib from '../../src/browser/jsx/services/common-react';

describe(__filename, function () {
  describe('shallowCompare', function () {
    const fn = lib[this.description];

    it('is true when both are equal', function () {
      const instance = {props: {}, state: {}};

      expect(fn(instance, {}, {})).toEqual(true);
    });

    it('is true when states are equal', function () {
      const instance = {state: {}};

      expect(fn(instance, undefined, {})).toEqual(true);
    });

    it('is true when props are equal', function () {
      const instance = {props: {}};

      expect(fn(instance, {})).toEqual(true);
    });

    it('is false when props are not equal', function () {
      const instance = {props: {}};

      expect(fn(instance, {a: 'b'})).toEqual(false);
    });

    it('is true when props are equal except for functions', function () {
      const instance = {props: {a: _.constant('b')}};

      expect(fn(instance, {a: _.constant('b')})).toEqual(true);
    });
  });
});
