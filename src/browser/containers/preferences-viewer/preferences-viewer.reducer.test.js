/* globals describe, it, expect */

import _ from 'lodash';
import Immutable from 'seamless-immutable';
import lib from './preferences-viewer.reducer';
import {local} from '../../services/store';

describe(__filename, () => {
  describe('PREFERENCE_CHANGE_SAVED', () => {
    it('adds', function () {
      const groupId = 'a',
        itemId = 'b',
        state = Immutable({
          active: groupId,
          preferenceMap: [{id: groupId, items: [{key: itemId}]}],
          changes: {b: {key: itemId, value: 'c'}},
          canSave: false
        }),
        action = {
          type: 'PREFERENCE_CHANGE_SAVED',
          change: {key: 'b'}
        };

      let result = lib(state, action);

      expect(result.changes).toEqual({});
      expect(result.canSave).toEqual(true);
    });
  });

  describe('PREFERENCE_CANCEL_ALL_CHANGES', () => {
    it('clears', function () {
      const groupId = 'a',
        itemId = 'b',
        state = Immutable({
          active: groupId,
          preferenceMap: [{id: groupId, items: [{key: itemId}]}],
          changes: {b: {key: itemId, value: 'c'}},
          canSave: false
        }),
        action = {type: 'PREFERENCE_CANCEL_ALL_CHANGES'};

      let result = lib(state, action);

      expect(result.changes).toEqual({});
      expect(result.canSave).toEqual(true);
    });
  });

  describe('PREFERENCE_ACTIVE_TAB_CHANGED', () => {
    it('changes', function () {
      const state = Immutable({
          active: 'a',
          preferenceMap: [{id: 'a'}, {id: 'b'}],
          changes: {},
          canSave: false
        }),
        action = {type: 'PREFERENCE_ACTIVE_TAB_CHANGED', active: 'b'};

      let result = lib(state, action);

      expect(result.active).toEqual('b');
    });
  });

  describe('PREFERENCE_CHANGE_DETAIL_ADDED', () => {
    it('changes from validating to valid', function () {
      const state = Immutable({
          active: 'a',
          preferenceMap: [{id: 'a'}, {id: 'b'}],
          changes: {b: {key: 'b', value: 'c', state: 'validating'}},
          canSave: false
        }),
        action = {type: 'PREFERENCE_CHANGE_DETAIL_ADDED', change: {key: 'b', value: 'c', state: 'valid'}};

      let result = lib(state, action);

      expect(result.changes).toEqual({b: {key: 'b', value: 'c', state: 'valid'}});
    });

    it('does not change value', function () {
      const state = Immutable({
          active: 'a',
          preferenceMap: [{id: 'a'}, {id: 'b'}],
          changes: {b: {key: 'b', value: 'c', state: 'valid'}},
          canSave: false
        }),
        action = {type: 'PREFERENCE_CHANGE_DETAIL_ADDED', change: {key: 'b', value: 'd'}};

      let result = lib(state, action);

      expect(result.changes).toEqual({b: {key: 'b', value: 'c', state: 'valid'}});
    });
  });

  describe('PREFERENCE_CHANGE_ADDED', () => {
    it('adds', function () {
      const state = Immutable({
          active: 'a',
          preferenceMap: [{id: 'a'}],
          changes: {},
          canSave: false
        }),
        action = {type: 'PREFERENCE_CHANGE_ADDED', change: {
          key: 'b',
          value: 'c'
        }};

      let result = lib(state, action);

      expect(result.changes).toEqual({b: {key: 'b', value: 'c', state: 'valid'}});
    });

    it('modifies', function () {
      local.setSource({getItem: _.constant(undefined)});

      const state = Immutable({
          active: 'a',
          preferenceMap: [{id: 'a'}],
          changes: {b: {key: 'b', value: 'c', state: 'valid'}},
          canSave: false
        }),
        action = {type: 'PREFERENCE_CHANGE_ADDED', change: {
          key: 'b',
          value: 'd'
        }};

      let result = lib(state, action);

      expect(result.changes).toEqual({b: {key: 'b', value: 'd', state: 'valid'}});
    });

    it('removes', function () {
      local.setSource({getItem: _.constant('c')});

      const state = Immutable({
          active: 'a',
          preferenceMap: [{id: 'a'}],
          changes: {b: {key: 'b', value: 'c', state: 'valid'}},
          canSave: false
        }),
        action = {type: 'PREFERENCE_CHANGE_ADDED', change: {
          key: 'b',
          value: 'd'
        }};

      let result = lib(state, action);

      expect(result.changes).toEqual({b: {key: 'b', value: 'd', state: 'valid'}});
    });
  });
});
