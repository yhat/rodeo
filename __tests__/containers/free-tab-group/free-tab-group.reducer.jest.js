/* globals describe, it, expect, jest */

jest.unmock('../../../src/browser/jsx/services/map-reducers');
jest.unmock('../../../src/browser/jsx/services/common-tabs-reducers');
jest.unmock('../../../src/browser/jsx/containers/free-tab-group/free-tab-group.reducer');

import Immutable from 'seamless-immutable';
import lib from '../../../src/browser/jsx/containers/free-tab-group/free-tab-group.reducer';

describe(__filename, () => {
  describe('ADD_TAB', () => {
    it('adds', function () {
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

  describe('CLOSE_TAB', () => {
    it('closes', function () {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'CLOSE_TAB', groupId: 'a', id: 'b'};

      let result = lib(state, action);

      expect(result[0].tabs).toEqual([{id: 'c'}]);
    });

    it('does not close last tab', function () {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b'}]}]),
        action = {type: 'CLOSE_TAB', groupId: 'a', id: 'b'};

      let result = lib(state, action);

      expect(result[0].tabs).toEqual([{id: 'b'}]);
    });

    it('sets second active if removed was first and active', function () {
      const state = Immutable([{groupId: 'a', active: 'b', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'CLOSE_TAB', groupId: 'a', id: 'b'};

      let result = lib(state, action);

      expect(result[0].active).toEqual('c');
    });

    it('sets first active if removed was second and active', function () {
      const state = Immutable([{groupId: 'a', active: 'c', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'CLOSE_TAB', groupId: 'a', id: 'c'};

      let result = lib(state, action);

      expect(result[0].active).toEqual('b');
    });
  });
});
