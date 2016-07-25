/* globals describe, it, expect, jest */

jest.unmock('../../src/browser/jsx/services/text-util');
import lib from '../../src/browser/jsx/services/text-util';

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
});
