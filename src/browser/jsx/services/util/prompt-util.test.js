/* globals describe, it, expect */

import lib from './prompt-util';

describe(__filename, function () {
  describe('removeSelection', function () {
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

      expect(lib.removeSelection(state, selection))
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

      expect(lib.removeSelection(state, selection))
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

      expect(lib.removeSelection(state, selection))
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

      expect(lib.removeSelection(state, selection))
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

      expect(lib.removeSelection(state, selection))
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

      expect(lib.removeSelection(state, selection))
        .toEqual({lines: ['abcd'], cursor: {row: 0, column: 4}});
    });
  });
});
