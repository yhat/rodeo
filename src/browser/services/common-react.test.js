/* globals describe, it, expect */

import _ from 'lodash';
import lib from './common-react';

describe(__filename, function () {
  describe('shallowCompare', function () {
    it('is true when both are equal', function () {
      const instance = {props: {}, state: {}};

      expect(lib.shallowEqual(instance, {}, {})).toEqual(true);
    });

    it('is true when states are equal', function () {
      const instance = {state: {}};

      expect(lib.shallowEqual(instance, undefined, {})).toEqual(true);
    });

    it('is true when props are equal', function () {
      const instance = {props: {}};

      expect(lib.shallowEqual(instance, {})).toEqual(true);
    });

    it('is false when props are not equal', function () {
      const instance = {props: {}};

      expect(lib.shallowEqual(instance, {a: 'b'})).toEqual(false);
    });

    it('is true when props are equal except for functions', function () {
      const instance = {props: {a: _.constant('b')}};

      expect(lib.shallowEqual(instance, {a: _.constant('b')})).toEqual(true);
    });
  });
});
