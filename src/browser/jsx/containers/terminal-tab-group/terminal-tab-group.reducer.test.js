/* globals describe, it, expect, jest */

jest.mock('../../services/store');

import Immutable from 'seamless-immutable';
import lib from './terminal-tab-group.reducer';

describe(__filename, () => {
  describe('FOCUS_TAB', () => {
    it('focuses', () => {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b'}]}]),
        action = {type: 'FOCUS_TAB', groupId: 'a', id: 'b'};

      expect(lib(state, action)).toEqual([{groupId: 'a', active: 'b', tabs: [{id: 'b'}]}]);
    });
  });

  describe('KERNEL_DETECTED', () => {
    it('updates single terminal', () => {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b', content: {}}]}]),
        action = {type: 'KERNEL_DETECTED', groupId: 'a', id: 'b', pythonOptions: {c: 'd'}};

      expect(lib(state, action)).toEqual([{groupId: 'a', tabs: [{id: 'b', content: {c: 'd'}}]}]);
    });
  });

  describe('CHANGE_PREFERENCE', () => {
    it('changes font size', () => {
      const state = Immutable([{groupId: 'a', tabs: [{id: 'b', content: {}}]}]),
        action = {type: 'CHANGE_PREFERENCE', groupId: 'a', id: 'b', key: 'fontSize', value: 1};

      expect(lib(state, action)).toEqual([{groupId: 'a', tabs: [{id: 'b', content: {fontSize: 1}}]}]);
    });
  });
});
