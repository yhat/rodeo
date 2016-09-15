/* globals describe, it, expect, jest */

jest.mock('../../services/store');

import $ from 'jquery';
import _ from 'lodash';
import Immutable from 'seamless-immutable';
import lib from './terminal-tab-group.actions';

describe(__filename, () => {
  describe('focus', function () {
    it('focuses jqConsole', function () {
      const id = 'b',
        focusFn = jest.fn(),
        data = {Focus: focusFn},
        dispatch = jest.fn(),
        getState = _.constant(Immutable({terminalTabGroups: [{groupId: 'a', tabs: [{id}]}]}));

      document.body.innerHTML =
        `<div id="${id}"><div class="terminal" /></div>`;

      $(`#${id}`).find('.terminal').data('jqconsole', data);

      let testFn = lib.focus('a', 'b');

      testFn(dispatch, getState);

      expect(dispatch.mock.calls[0][0]).toEqual({type: 'FOCUS_TAB', groupId: 'a', id: 'b'});
      expect(focusFn.mock.calls.length).toBe(1);
    });
  });
});
