/* globals describe, it, expect */

import lib from './text-util';

describe(__filename, function () {
  describe('getCursorPosFromRowColumn', function () {
    it('is correct on the first row', function () {
      expect(lib.getCursorPosFromRowColumn('abcd', 0, 2)).toEqual(2);
    });

    it('is correct on the third row', function () {
      expect(lib.getCursorPosFromRowColumn('abcd\nefgh\nijkl', 2, 2)).toEqual(12);
    });

    it('is correct at the very beginning', function () {
      expect(lib.getCursorPosFromRowColumn('abcd\nefgh\nijkl', 0, 0)).toEqual(0);
    });

    it('is correct at the end of a line', function () {
      expect(lib.getCursorPosFromRowColumn('abcd\nefgh\nijkl', 1, 3)).toEqual(8);
    });
  });

  describe('getRowColumnFromCursorPos', function () {
    it('is correct on the first row', function () {
      expect(lib.getRowColumnFromCursorPos('abcd', 2)).toEqual({row: 0, column: 2});
    });

    it('is correct on the third row', function () {
      expect(lib.getRowColumnFromCursorPos('abcd\nefgh\nijkl', 12)).toEqual({row: 2, column: 2});
    });

    it('is correct at the very beginning', function () {
      expect(lib.getRowColumnFromCursorPos('abcd\nefgh\nijkl', 0)).toEqual({row: 0, column: 0});
    });

    it('is correct at the end of a line', function () {
      expect(lib.getRowColumnFromCursorPos('abcd\nefgh\nijkl', 8)).toEqual({row: 1, column: 3});
    });
  });

  describe('spliceString', function () {
    it('inserts into string', function () {
      expect(lib.spliceString('abcd', 2, 0, 'ef')).toEqual('abefcd');
    });

    it('removes from string', function () {
      expect(lib.spliceString('abcdef', 2, 2)).toEqual('abef');
    });
  });

  describe('longestLength', function () {
    it('returns length 0 of empty array', function () {
      expect(lib.longestLength([])).toEqual(0);
    });

    it('returns length 5', function () {
      expect(lib.longestLength(['', 'abcde'])).toEqual(5);
    });
  });

  describe('padRight', function () {
    it('returns length 0', function () {
      expect(lib.padRight('a', 0)).toEqual('a');
    });

    it('returns text with length 5 from small text', function () {
      expect(lib.padRight('a', 5)).toEqual('a    ');
    });

    it('returns text with length 5 from medium text', function () {
      expect(lib.padRight('abc', 5)).toEqual('abc  ');
    });

    it('returns text with length 5 from full text', function () {
      expect(lib.padRight('abcef', 5)).toEqual('abcef');
    });
  });

  describe('fromAsciiToHtml', function () {
    it('returns html as escaped text', function () {
      expect(lib.fromAsciiToHtml('<h1>Hi!</h1>')).toEqual('&lt;h1&gt;Hi!&lt;/h1&gt;');
    });
  });
});
