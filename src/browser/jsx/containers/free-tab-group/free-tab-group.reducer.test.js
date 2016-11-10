/* globals describe, it, expect, jest */

jest.mock('../../services/store');
jest.mock('./tab-types', () => {
  const knownTypes = {
    someKnownType: () => { return {}; },
    someKnownTypeWithContent: () => { return {a: 'b', content: {c: 'd'}}; }
  };

  return {
    getDefaultTab: jest.fn(contentType => {
      return knownTypes[contentType] && knownTypes[contentType]();
    })
  };
});
jest.mock('../../services/dateUtil');

import Immutable from 'seamless-immutable';
import lib from './free-tab-group.reducer';

describe(__filename, () => {
  describe('ADD_TAB', () => {
    it('does not add when missing context type', function () {
      const state = Immutable([{groupId: 'a', tabs: []}]),
        action = {type: 'ADD_TAB', groupId: 'a', tab: {}};

      let result = lib(state, action);

      expect(result[0].tabs.length).toEqual(0);
    });

    it('adds when known contextType', function () {
      const state = Immutable([{groupId: 'a', tabs: []}]),
        action = {type: 'ADD_TAB', groupId: 'a', tab: {contentType: 'someKnownType'}};

      let result = lib(state, action);

      expect(result[0].tabs.length).toEqual(1);
    });

    it('adds content', function () {
      const state = Immutable([{groupId: 'a', tabs: []}]),
        action = {type: 'ADD_TAB', groupId: 'a', tab: {contentType: 'someKnownTypeWithContent', content: {e: 'f'}}};

      let result = lib(state, action);

      expect(result[0].tabs[0]).toEqual({
        a: 'b',
        contentType: 'someKnownTypeWithContent',
        content: {c: 'd', e: 'f'}
      });
    });

    it('merges content', function () {
      const state = Immutable([{groupId: 'a', tabs: []}]),
        action = {type: 'ADD_TAB', groupId: 'a', tab: {contentType: 'someKnownTypeWithContent', a: 'f', content: {c: 'g'}}};

      let result = lib(state, action);

      expect(result[0].tabs[0]).toEqual({
        a: 'f',
        contentType: 'someKnownTypeWithContent',
        content: {c: 'g'}
      });
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
