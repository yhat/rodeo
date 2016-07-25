/* globals describe, it, expect, jest */

jest.unmock('../../src/browser/jsx/services/ace-python-completer');
import _ from 'lodash';
import bluebird from 'bluebird';
import lib from '../../src/browser/jsx/services/ace-python-completer';
import client from '../../src/browser/jsx/services/client';
import textUtil from '../../src/browser/jsx/services/text-util';

global.Promise = bluebird;

describe(__filename, function () {
  describe('getCompletions', function () {
    it('is empty on empty matches', function () {
      const code = '',
        editor = {},
        session = {
          $mode: {},
          getValue: _.constant(code)
        },
        pos = {row: 0, column: 0},
        prefix = '',
        callback = jest.fn(),
        result = {matches: []};

      client.getAutoComplete.mockReturnValueOnce(bluebird.resolve(result));

      return lib.getCompletions(editor, session, pos, prefix, callback).then(function () {
        expect(callback.mock.calls[0]).toEqual([null, []]);
      });
    });

    it('is returns one result on one match', function () {
      const code = '',
        editor = {},
        session = {
          $mode: {},
          getValue: _.constant(code)
        },
        pos = {row: 0, column: 0},
        prefix = '',
        callback = jest.fn(),
        result = {matches: ['hi']};

      client.getAutoComplete.mockReturnValueOnce(bluebird.resolve(result));

      return lib.getCompletions(editor, session, pos, prefix, callback).then(function () {
        console.log('callback call', callback.mock.calls[0]);

        expect(callback.mock.calls[0]).toEqual([null, [{ caption: 'hi', value: 'hi', score: 100, meta: null }]]);
      });
    });
  });
});
