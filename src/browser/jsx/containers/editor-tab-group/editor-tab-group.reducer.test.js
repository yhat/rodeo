/* globals describe, it, expect, jest */

jest.mock('../../services/store');
jest.mock('../../services/dateUtil');

import Immutable from 'seamless-immutable';
import lib from './editor-tab-group.reducer';

describe(__filename, () => {
  describe('ADD_TAB', () => {
    it('adds', function () {
      const state = Immutable([{groupId: 'a', tabs: []}]),
        action = {type: 'ADD_TAB', groupId: 'a'};

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

  describe('CLOSE_ACTIVE_TAB', () => {
    it('does not close only tab', function () {
      const state = Immutable([{groupId: 'a', active: 'b', tabs: [{id: 'b'}]}]),
        action = {type: 'CLOSE_ACTIVE_TAB', groupId: 'a'};

      let result = lib(state, action);

      expect(result[0].tabs).toEqual([{id: 'b'}]);
    });

    it('closes one tab if multiple', function () {
      const state = Immutable([{groupId: 'a', active: 'b', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'CLOSE_ACTIVE_TAB', groupId: 'a'};

      let result = lib(state, action);

      expect(result[0].tabs).toEqual([{id: 'c'}]);
    });
  });

  describe('CLOSE_ACTIVE_FILE', function () {
    it('closes tab in first group without saying groupId', () => {
      const state = Immutable([{groupId: 'a', active: 'b', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'CLOSE_ACTIVE_FILE'};

      let result = lib(state, action);

      expect(result[0].tabs).toEqual([{id: 'c'}]);
    });
  });

  describe('PREFERENCE_CHANGE_SAVED', function () {
    it('closes tab in first group without saying groupId', () => {
      const state = Immutable([{groupId: 'a', active: 'b', tabs: [{id: 'b'}]}]),
        action = {type: 'PREFERENCE_CHANGE_SAVED', change: {key: 'fontSize', value: 2}};

      let result = lib(state, action);

      expect(result[0].tabs).toEqual([{id: 'b', content: {fontSize: 2}}]);
    });
  });

  describe('MOVE_ONE_RIGHT', function () {
    it('moves active one right', () => {
      const state = Immutable([{groupId: 'a', active: 'b', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'MOVE_ONE_RIGHT'};

      let result = lib(state, action);

      expect(result[0].active).toEqual('c');
    });

    it('does not move if on the far right', () => {
      const state = Immutable([{groupId: 'a', active: 'c', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'MOVE_ONE_RIGHT'};

      let result = lib(state, action);

      expect(result[0].active).toEqual('c');
    });
  });

  describe('MOVE_ONE_LEFT', function () {
    it('moves active one left', () => {
      const state = Immutable([{groupId: 'a', active: 'c', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'MOVE_ONE_LEFT'};

      let result = lib(state, action);

      expect(result[0].active).toEqual('b');
    });

    it('does not move if on the far left', () => {
      const state = Immutable([{groupId: 'a', active: 'b', tabs: [{id: 'b'}, {id: 'c'}]}]),
        action = {type: 'MOVE_ONE_LEFT'};

      let result = lib(state, action);

      expect(result[0].active).toEqual('b');
    });
  });
});
