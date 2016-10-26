/* globals describe, it, expect */

import lib from './prompt-util';

describe(__filename, function () {
  describe('getNextWordIndex', function () {
    it('returns end of line when there are no words', function () {
      expect(lib.getNextWordIndex('abcd', 0)).toEqual(4);
    });

    it('returns end of line when starting in last word', function () {
      expect(lib.getNextWordIndex('abcd efgh', 5)).toEqual(9);
    });

    it('returns second word when starting in first word', function () {
      expect(lib.getNextWordIndex('abcd efgh', 2)).toEqual(5);
    });

    it('returns second word when starting at beginning of line', function () {
      expect(lib.getNextWordIndex('abcd efgh', 0)).toEqual(5);
    });

    it('returns -1 when starting at the end', function () {
      expect(lib.getNextWordIndex('abcd', 4)).toEqual(-1);
    });
  });

  describe('getPreviousWordIndex', function () {
    it('returns -1 when at beginning of line', function () {
      expect(lib.getPreviousWordIndex('abcd', 0)).toEqual(-1);
    });

    it('returns 0 when at middle of first word', function () {
      expect(lib.getPreviousWordIndex('abcd', 2)).toEqual(0);
    });

    it('returns start of second word when at middle of second word', function () {
      expect(lib.getPreviousWordIndex('abcd efgh', 7)).toEqual(5);
    });

    it('returns start of second word when at beginning of third word', function () {
      expect(lib.getPreviousWordIndex('abcd efgh ijkl', 10)).toEqual(5);
    });
  });

  describe('removeSelectionFromState', function () {
    it('removes from middle of single line', function () {
      const state = {lines: ['abcd'], cursor: {row: 0, column: 0}},
        selection = [{
          length: 2,
          selectedText: 'bc',
          start: 1,
          text: 'abcd',
          selected: true,
          selectedCompletely: false
        }];

      expect(lib.removeSelectionFromState(state, selection))
        .toEqual({lines: ['ad'], cursor: {row: 0, column: 1}});
    });

    it('removes whole line single line', function () {
      const state = {lines: ['abcd'], cursor: {row: 0, column: 0}},
        selection = [{
          length: 4,
          selectedText: 'abcd',
          start: 0,
          text: 'abcd',
          selected: true,
          selectedCompletely: true
        }];

      expect(lib.removeSelectionFromState(state, selection))
        .toEqual({lines: [''], cursor: {row: 0, column: 0}});
    });

    it('removes completely selected second line of three lines', function () {
      const state = {lines: ['abcd', 'abcd', 'abcd'], cursor: {row: 0, column: 0}},
        selection = [{
          length: 0,
          selectedText: '',
          start: 0,
          text: 'abcd',
          selected: false,
          selectedCompletely: false
        }, {
          length: 4,
          selectedText: 'abcd',
          start: 0,
          text: 'abcd',
          selected: true,
          selectedCompletely: true
        }, {
          length: 0,
          selectedText: '',
          start: 0,
          text: 'abcd',
          selected: false,
          selectedCompletely: false
        }];

      expect(lib.removeSelectionFromState(state, selection))
        .toEqual({lines: ['abcd', 'abcd'], cursor: {row: 1, column: 0}});
    });

    it('removes partially selected second line of three lines', function () {
      const state = {lines: ['abcd', 'abcd', 'abcd'], cursor: {row: 0, column: 0}},
        selection = [{
          length: 0,
          selectedText: '',
          start: 0,
          text: 'abcd',
          selected: false,
          selectedCompletely: false
        }, {
          length: 2,
          selectedText: 'bc',
          start: 1,
          text: 'abcd',
          selected: true,
          selectedCompletely: false
        }, {
          length: 0,
          selectedText: '',
          start: 0,
          text: 'abcd',
          selected: false,
          selectedCompletely: false
        }];

      expect(lib.removeSelectionFromState(state, selection))
        .toEqual({lines: ['abcd', 'ad', 'abcd'], cursor: {row: 1, column: 1}});
    });

    it('removes last two lines completely', function () {
      const state = {lines: ['abcd', 'abcd', 'abcd'], cursor: {row: 0, column: 0}},
        selection = [{
          length: 0,
          selectedText: '',
          start: 0,
          text: 'abcd',
          selected: false,
          selectedCompletely: false
        }, {
          length: 4,
          selectedText: 'abcd',
          start: 1,
          text: 'abcd',
          selected: true,
          selectedCompletely: true
        }, {
          length: 4,
          selectedText: 'abcd',
          start: 0,
          text: 'abcd',
          selected: true,
          selectedCompletely: true
        }];

      expect(lib.removeSelectionFromState(state, selection))
        .toEqual({lines: ['abcd'], cursor: {row: 0, column: 4}});
    });

    it('removes last two lines completely, but last line is not marked selectedCompletely', function () {
      const state = {lines: ['abcd', 'abcd', 'abcd'], cursor: {row: 0, column: 0}},
        selection = [{
          length: 0,
          selectedText: '',
          start: 0,
          text: 'abcd',
          selected: false,
          selectedCompletely: false
        }, {
          length: 4,
          selectedText: 'abcd',
          start: 1,
          text: 'abcd',
          selected: true,
          selectedCompletely: true
        }, {
          length: 4,
          selectedText: 'abcd',
          start: 0,
          text: 'abcd',
          selected: true,
          selectedCompletely: false
        }];

      expect(lib.removeSelectionFromState(state, selection))
        .toEqual({lines: ['abcd'], cursor: {row: 0, column: 4}});
    });
  });
});
