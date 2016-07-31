/* globals describe, it, expect, jest */

jest.unmock('../../../src/browser/jsx/services/map-reducers');
jest.unmock('../../../src/browser/jsx/services/common-tabs-reducers');
jest.unmock('../../../src/browser/jsx/containers/editor-tab-group/editor-tab-group.reducer');

import Immutable from 'seamless-immutable';
import lib from '../../../src/browser/jsx/containers/editor-tab-group/editor-tab-group.reducer';

describe(__filename, () => {
  describe('ADD_TAB', () => {
    it('addes', function () {
      const state = Immutable([{groupId: 'a', tabs: []}]),
        action = {type: 'ADD_TAB', groupId: 'a', id: 'b'};

      let result = lib(state, action);

      expect(result[0].tabs.length).toEqual(1);
    });
  });

  describe('FOCUS_TAB', () => {
    it('focuses', () => {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b'}]}]),
        action = {type: 'FOCUS_TAB', groupId: 'a', id: 'b'};

      expect(lib(state, action)).toEqual([{groupId: 'a', active: 'b', tabs: [{id: 'b'}]}]);
    });
  });
});
