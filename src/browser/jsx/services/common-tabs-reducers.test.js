/* globals describe, it, expect, jest */

jest.mock('./jupyter/client');
jest.mock('./dateUtil');

import _ from 'lodash';
import Immutable from 'seamless-immutable';
import lib from './common-tabs-reducers';

describe(__filename, function () {
  describe('changeProperty', function () {
    it('changes properties', function () {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b'}]}]),
        propertyName = 'c',
        value = 'd';

      let result = lib.changeProperty(state, propertyName, value);

      expect(result).toEqual([{groupId: 'a', tabs: [{id: 'b', content: {c: 'd'}}]}]);
    });

    it('changes properties with transform', function () {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b'}]}]),
        propertyName = 'c',
        value = '4',
        transform = _.toNumber;

      let result = lib.changeProperty(state, propertyName, value, transform);

      expect(result).toEqual([{groupId: 'a', tabs: [{id: 'b', content: {c: 4}}]}]);
    });
  });

  describe('focus', function () {
    it('focuses', function () {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b'}]}]),
        action = {groupId: 'a', id: 'b'};

      let result = lib.focus(state, action);

      expect(result).toEqual([{groupId: 'a', active: 'b', tabs: [{id: 'b'}]}]);
    });

    it('does not focus missing tab', function () {
      const state = Immutable([{groupId: 'a', active: 'b', tabs: [{id: 'b'}]}]),
        action = {groupId: 'a', id: 'c'};

      let result = lib.focus(state, action);

      expect(result).toEqual([{groupId: 'a', active: 'b', tabs: [{id: 'b'}]}]);
    });

    it('does not focus missing group', function () {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b'}]}]),
        action = {groupId: 'c', id: 'b'};

      let result = lib.focus(state, action);

      expect(result).toEqual([{groupId: 'a', tabs: [{id: 'b'}]}]);
    });
  });
});
