/* globals describe, it */
import { expect } from 'chai';
import lib from '../../../src/browser/jsx/services/text-util';
import sinon from 'sinon';

describe(__filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getCursorPosFromRowColumn', function () {
    it('is correct on the first row', function () {
      expect(lib.getCursorPosFromRowColumn('abcd', 0, 2)).to.equal(2);
    });

    it('is correct on the third row', function () {
      expect(lib.getCursorPosFromRowColumn('abcd\nefgh\nijkl', 2, 2)).to.equal(12);
    });

    it('is correct at the very beginning', function () {
      expect(lib.getCursorPosFromRowColumn('abcd\nefgh\nijkl', 0, 0)).to.equal(0);
    });

    it('is correct at the end of a line', function () {
      expect(lib.getCursorPosFromRowColumn('abcd\nefgh\nijkl', 1, 3)).to.equal(8);
    });
  });

  describe('spliceString', function () {
    it('inserts into string', function () {
      expect(lib.spliceString('abcd', 2, 0, 'ef')).to.equal('abefcd');
    });

    it('removes from string', function () {
      expect(lib.spliceString('abcdef', 2, 2)).to.equal('abef');
    });
  });

  describe('longestLength', function () {
    it('returns length 0 of empty array', function () {
      expect(lib.longestLength([])).to.equal(0);
    });

    it('returns length 5', function () {
      expect(lib.longestLength(['', 'abcde'])).to.equal(5);
    });
  });

  describe('padRight', function () {
    it('returns length 0', function () {
      expect(lib.padRight('a', 0)).to.equal('a');
    });

    it('returns text with length 5 from small text', function () {
      expect(lib.padRight('a', 5)).to.equal('a    ');
    });

    it('returns text with length 5 from medium text', function () {
      expect(lib.padRight('abc', 5)).to.equal('abc  ');
    });

    it('returns text with length 5 from full text', function () {
      expect(lib.padRight('abcef', 5)).to.equal('abcef');
    });
  });
});
