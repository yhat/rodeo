/* globals describe, it, expect, jest */

jest.mock('./jupyter/client');

import _ from 'lodash';
import bluebird from 'bluebird';
import lib from './ace-python-completer';
import client from './jupyter/client';
import textUtil from './text-util';

global.Promise = bluebird;

function createEditor(code, pos) {
  const session = {
    $mode: {},
    getCursorPosition: _.constant(pos),
    getValue: _.constant(code),
    getTextRange: (pos) => code.substr(
      textUtil.getCursorPosFromRowColumn(code, pos.start.row, pos.start.column),
      textUtil.getCursorPosFromRowColumn(code, pos.end.row, pos.end.column)
    )
  };

  return {
    getSession: _.constant(session)
  };
}

describe(__filename, function () {
  describe('getCompletions', function () {
    it('is empty on empty matches', function () {
      const code = '',
        pos = {row: 0, column: 0},
        editor = createEditor(code, pos),
        prefix = '',
        callback = jest.fn(),
        result = {matches: []},
        expectedResult = [];

      client.getAutoComplete.mockReturnValueOnce(bluebird.resolve(result));
      return lib.getCompletions(editor, editor.getSession(), pos, prefix, callback).then(function () {
        expect(callback.mock.calls[0][1]).toEqual(expectedResult);
      });
    });

    it('is returns one result on one match', function () {
      const code = '',
        pos = {row: 0, column: 0},
        editor = createEditor(code, pos),
        prefix = '',
        callback = jest.fn(),
        result = {matches: ['hi']},
        expectedValue = 'hi',
        expectedCaption = 'hi';

      client.getAutoComplete.mockReturnValueOnce(bluebird.resolve(result));
      return lib.getCompletions(editor, editor.getSession(), pos, prefix, callback).then(function () {
        const firstMatch = callback.mock.calls[0][1][0];

        expect(firstMatch.value).toEqual(expectedValue);
        expect(firstMatch.caption).toEqual(expectedCaption);
      });
    });
  });
});
