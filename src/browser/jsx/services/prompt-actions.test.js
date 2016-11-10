/* globals describe, it, expect */

import lib from './prompt-actions';

describe(__filename, function () {
  describe('breakLine', function () {
    it('breaking the middle of the second line with no line following', function () {
      expect(lib.breakLine({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 2}
      })).toEqual({
        lines: ['abcd', 'ef', 'gh'],
        cursor: {row: 2, column: 0}
      });
    });

    it('breaking the middle of the first line', function () {
      expect(lib.breakLine({
        lines: ['abcd', 'efgh'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['ab', 'cd', 'efgh'],
        cursor: {row: 1, column: 0}
      });
    });

    it('breaking the middle of the second line with another line following', function () {
      expect(lib.breakLine({
        lines: ['abcd', 'efgh', 'ijkl'],
        cursor: {row: 1, column: 2}
      })).toEqual({
        lines: ['abcd', 'ef', 'gh', 'ijkl'],
        cursor: {row: 2, column: 0}
      });
    });
  });

  describe('clear', function () {
    it('should clear everything', function () {
      expect(lib.clear({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 2}
      })).toEqual({
        lines: [''],
        cursor: {row: 0, column: 0}
      });
    });
  });

  describe('insertKey', function () {
    it('insert key into empty line', function () {
      expect(lib.insertKey({
        lines: [''],
        cursor: {row: 0, column: 0}
      }, {key: 'f'})).toEqual({
        lines: ['f'],
        cursor: {row: 0, column: 1}
      });
    });

    it('insert key into middle of line', function () {
      expect(lib.insertKey({
        lines: ['abcd'],
        cursor: {row: 0, column: 2}
      }, {key: 'f'})).toEqual({
        lines: ['abfcd'],
        cursor: {row: 0, column: 3}
      });
    });
  });

  describe('backspace', function () {
    it('remove key from middle of line', function () {
      expect(lib.backspace({
        lines: ['abcd'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['acd'],
        cursor: {row: 0, column: 1}
      });
    });

    it('do nothing at beginning of line', function () {
      expect(lib.backspace({
        lines: ['abcd'],
        cursor: {row: 0, column: 0}
      })).toEqual({
        lines: ['abcd'],
        cursor: {row: 0, column: 0}
      });
    });

    it('merge two lines', function () {
      expect(lib.backspace({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 0}
      })).toEqual({
        lines: ['abcdefgh'],
        cursor: {row: 0, column: 8}
      });
    });

    it('merge two lines with preceeding lines', function () {
      expect(lib.backspace({
        lines: ['abcd', 'efgh', 'ijkl'],
        cursor: {row: 2, column: 0}
      })).toEqual({
        lines: ['abcd', 'efghijkl'],
        cursor: {row: 1, column: 8}
      });
    });

    it('merge two lines with following lines', function () {
      expect(lib.backspace({
        lines: ['abcd', 'efgh', 'ijkl'],
        cursor: {row: 1, column: 0}
      })).toEqual({
        lines: ['abcdefgh', 'ijkl'],
        cursor: {row: 0, column: 8}
      });
    });
  });

  describe('moveLeft', function () {
    it('move left at beginning of empty line', function () {
      expect(lib.moveLeft({
        lines: [''],
        cursor: {row: 0, column: 0}
      })).toEqual({
        lines: [''],
        cursor: {row: 0, column: 0}
      });
    });

    it('move left at middle of first line', function () {
      expect(lib.moveLeft({
        lines: ['abcd'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['abcd'],
        cursor: {row: 0, column: 1}
      });
    });

    it('move left at end of first line', function () {
      expect(lib.moveLeft({
        lines: ['abcd'],
        cursor: {row: 0, column: 4}
      })).toEqual({
        lines: ['abcd'],
        cursor: {row: 0, column: 3}
      });
    });

    it('move left at start of second line', function () {
      expect(lib.moveLeft({
        lines: ['abcd', 'edfg'],
        cursor: {row: 1, column: 0}
      })).toEqual({
        lines: ['abcd', 'edfg'],
        cursor: {row: 0, column: 4}
      });
    });
  });

  describe('moveRight', function () {
    it('move right at beginning of empty line', function () {
      expect(lib.moveRight({
        lines: [''],
        cursor: {row: 0, column: 0}
      })).toEqual({
        lines: [''],
        cursor: {row: 0, column: 0}
      });
    });

    it('move right at middle of first line', function () {
      expect(lib.moveRight({
        lines: ['abcd'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['abcd'],
        cursor: {row: 0, column: 3}
      });
    });

    it('move right at end of first line', function () {
      expect(lib.moveRight({
        lines: ['abcd'],
        cursor: {row: 0, column: 4}
      })).toEqual({
        lines: ['abcd'],
        cursor: {row: 0, column: 4}
      });
    });

    it('move right at end of first line when second line exists', function () {
      expect(lib.moveRight({
        lines: ['abcd', 'edfg'],
        cursor: {row: 0, column: 4}
      })).toEqual({
        lines: ['abcd', 'edfg'],
        cursor: {row: 1, column: 0}
      });
    });
  });

  describe('moveUp', function () {
    it('move up on first line', function () {
      expect(lib.moveUp({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 2}
      })).toEqual({
        lines: ['abcd', 'efgh'],
        cursor: {row: 0, column: 2}
      });
    });

    it('move up when line above is longer than cursor position', function () {
      expect(lib.moveUp({
        lines: ['abcd', 'ef'],
        cursor: {row: 1, column: 2}
      })).toEqual({
        lines: ['abcd', 'ef'],
        cursor: {row: 0, column: 2}
      });
    });

    it('move up when line above is shorter than cursor position', function () {
      expect(lib.moveUp({
        lines: ['ab', 'cdef'],
        cursor: {row: 1, column: 3}
      })).toEqual({
        lines: ['ab', 'cdef'],
        cursor: {row: 0, column: 2}
      });
    });

    it('move up when at the end of the line and above line is equal', function () {
      expect(lib.moveUp({
        lines: ['abcd', 'edfg'],
        cursor: {row: 1, column: 4}
      })).toEqual({
        lines: ['abcd', 'edfg'],
        cursor: {row: 0, column: 4}
      });
    });

    it('does not move up when on first line', function () {
      expect(lib.moveUp({
        lines: ['abcd', 'edfg'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['abcd', 'edfg'],
        cursor: {row: 0, column: 2}
      });
    });
  });

  describe('moveDown', function () {
    it('move down on first line', function () {
      expect(lib.moveDown({
        lines: ['abcd', 'efgh'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 2}
      });
    });

    it('move down when line below is shorter than cursor position', function () {
      expect(lib.moveDown({
        lines: ['abcd', 'ef'],
        cursor: {row: 0, column: 3}
      })).toEqual({
        lines: ['abcd', 'ef'],
        cursor: {row: 1, column: 2}
      });
    });

    it('move down when line below is longer than cursor position', function () {
      expect(lib.moveDown({
        lines: ['ab', 'cdef'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['ab', 'cdef'],
        cursor: {row: 1, column: 2}
      });
    });

    it('move down when at the end of the line and below line is equal', function () {
      expect(lib.moveDown({
        lines: ['abcd', 'edfg'],
        cursor: {row: 0, column: 4}
      })).toEqual({
        lines: ['abcd', 'edfg'],
        cursor: {row: 1, column: 4}
      });
    });

    it('does not move down when on last line', function () {
      expect(lib.moveDown({
        lines: ['abcd', 'edfg'],
        cursor: {row: 1, column: 2}
      })).toEqual({
        lines: ['abcd', 'edfg'],
        cursor: {row: 1, column: 2}
      });
    });
  });

  describe('execute', function () {
    it('adds to history when exists', function () {
      expect(lib.execute({
        lines: ['abcd', 'efgh'],
        cursor: {row: 0, column: 2},
        history: [{lines: ['ijkl']}]
      })).toEqual({
        lines: [''],
        cursor: {row: 0, column: 0},
        historyIndex: -1,
        history: [{lines: ['abcd', 'efgh']}, {lines: ['ijkl']}]
      });
    });

    it('creates new history when does not exist', function () {
      expect(lib.execute({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 3}
      })).toEqual({
        lines: [''],
        cursor: {row: 0, column: 0},
        historyIndex: -1,
        history: [{lines: ['abcd', 'efgh']}]
      });
    });

    it('executing history makes us current again (removes history index)', function () {
      expect(lib.execute({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 3},
        history: [{lines: ['ef']}],
        historyIndex: 0
      })).toEqual({
        lines: [''],
        cursor: {row: 0, column: 0},
        historyIndex: -1,
        history: [{lines: ['abcd', 'efgh']}, {lines: ['ef']}]
      });
    });
  });

  describe('showPrevious', function () {
    it('shows previous command', function () {
      let state = lib.execute({lines: ['abcd'], cursor: {row: 0, column: 2}});

      expect(lib.showPrevious(state)).toEqual({
        lines: ['abcd'],
        cursor: {row: 0, column: 4},
        history: [{lines: ['']}, {lines: ['abcd']}],
        historyIndex: 1
      });
    });

    it('shows two previous commands', function () {
      let state = lib.execute({lines: ['abcd'], cursor: {row: 0, column: 2}});

      state = lib.insertKey(state, {key: 'e'});
      state = lib.insertKey(state, {key: 'f'});
      state = lib.execute(state);
      state = lib.showPrevious(state);
      state = lib.showPrevious(state);

      expect(state).toEqual({
        lines: ['abcd'],
        cursor: {row: 0, column: 4},
        history: [{lines: ['']}, {lines: ['ef']}, {lines: ['abcd']}],
        historyIndex: 2
      });
    });

    it('shows previous commands even when moving around', function () {
      let state = lib.execute({lines: ['abcd'], cursor: {row: 0, column: 2}});

      state = lib.insertKey(state, {key: 'e'});
      state = lib.insertKey(state, {key: 'f'});
      state = lib.breakLine(state);
      state = lib.insertKey(state, {key: 'g'});
      state = lib.insertKey(state, {key: 'h'});
      state = lib.execute(state);
      state = lib.showPrevious(state);

      expect(lib.moveUp(state)).toEqual({
        lines: ['ef', 'gh'],
        cursor: {row: 0, column: 2},
        history: [{lines: ['']}, {lines: ['ef', 'gh']}, {lines: ['abcd']}],
        historyIndex: 1
      });
    });
  });

  describe('showNext', function () {
    it('shows next command', function () {
      expect(lib.showNext({
        lines: ['abcd'],
        cursor: {row: 0, column: 0},
        historyIndex: 2,
        history: [{lines: ['ef']}, {lines: ['gh']}, {lines: ['abcd']}]
      })).toEqual({
        lines: ['gh'],
        cursor: {row: 0, column: 0},
        history: [{lines: ['ef']}, {lines: ['gh']}, {lines: ['abcd']}],
        historyIndex: 1
      });
    });

    it('shows next command while keeping the same cursor position', function () {
      expect(lib.showNext({
        lines: ['abcd'],
        cursor: {row: 0, column: 2},
        historyIndex: 2,
        history: [{lines: ['ef']}, {lines: ['gh']}, {lines: ['abcd']}]
      })).toEqual({
        lines: ['gh'],
        cursor: {row: 0, column: 2},
        history: [{lines: ['ef']}, {lines: ['gh']}, {lines: ['abcd']}],
        historyIndex: 1
      });
    });

    it('shows next command while keeping max cursor position when lines is shorter than last', function () {
      expect(lib.showNext({
        lines: ['abcd'],
        cursor: {row: 0, column: 4},
        historyIndex: 2,
        history: [{lines: ['ef']}, {lines: ['gh']}, {lines: ['abcd']}]
      })).toEqual({
        lines: ['gh'],
        cursor: {row: 0, column: 2},
        history: [{lines: ['ef']}, {lines: ['gh']}, {lines: ['abcd']}],
        historyIndex: 1
      });
    });

    it('exits history', function () {
      expect(lib.showNext(lib.showNext({
        lines: ['abcd'],
        cursor: {row: 0, column: 0},
        historyIndex: 1,
        history: [{lines: ['ef']}, {lines: ['abcd']}]
      }))).toEqual({
        lines: ['ef'],
        cursor: {row: 0, column: 0},
        historyIndex: -1,
        history: [{lines: ['abcd']}]
      });
    });

    it('does nothing when no history to move to', function () {
      expect(lib.showNext(lib.showNext({
        lines: ['ef'],
        cursor: {row: 0, column: 0},
        history: [{lines: ['ef']}, {lines: ['gh']}, {lines: ['abcd']}]
      }))).toEqual({
        lines: ['ef'],
        cursor: {row: 0, column: 0},
        history: [{lines: ['ef']}, {lines: ['gh']}, {lines: ['abcd']}]
      });
    });
  });

  describe('moveToPrecedingWord', function () {
    it('moves to beginning of second word when in second word', function () {
      expect(lib.moveToPrecedingWord({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 7}
      })).toEqual({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 5}
      });
    });

    it('moves to beginning of first word when at beginning of second word', function () {
      expect(lib.moveToPrecedingWord({
        lines: ['abcd efgh ijkl'],
        cursor: {row: 0, column: 5}
      })).toEqual({
        lines: ['abcd efgh ijkl'],
        cursor: {row: 0, column: 0}
      });
    });

    it('moves to end of previous line when at beginning of current line', function () {
      expect(lib.moveToPrecedingWord({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 0}
      })).toEqual({
        lines: ['abcd', 'efgh'],
        cursor: {row: 0, column: 4}
      });
    });
  });

  describe('moveToFollowingWord', function () {
    it('moves to beginning of second word when in first word', function () {
      expect(lib.moveToFollowingWord({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 5}
      });
    });

    it('moves to beginning of third word when at beginning of second word', function () {
      expect(lib.moveToFollowingWord({
        lines: ['abcd efgh ijkl'],
        cursor: {row: 0, column: 5}
      })).toEqual({
        lines: ['abcd efgh ijkl'],
        cursor: {row: 0, column: 10}
      });
    });

    it('moves to second line when at end of first line', function () {
      expect(lib.moveToFollowingWord({
        lines: ['abcd', 'efgh'],
        cursor: {row: 0, column: 4}
      })).toEqual({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 0}
      });
    });
  });

  describe('removePreviousWord', function () {
    it('removes from middle of second word', function () {
      expect(lib.removePreviousWord({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 7}
      })).toEqual({
        lines: ['abcd gh'],
        cursor: {row: 0, column: 5}
      });
    });

    it('removes from middle of first word', function () {
      expect(lib.removePreviousWord({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['cd efgh'],
        cursor: {row: 0, column: 0}
      });
    });

    it('removes from beginning of second word', function () {
      expect(lib.removePreviousWord({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 5}
      })).toEqual({
        lines: ['efgh'],
        cursor: {row: 0, column: 0}
      });
    });

    it('merges lines when at beginning', function () {
      expect(lib.removePreviousWord({
        lines: ['abcd', 'efgh'],
        cursor: {row: 1, column: 0}
      })).toEqual({
        lines: ['abcdefgh'],
        cursor: {row: 0, column: 8}
      });
    });
  });

  describe('removeNextWord', function () {
    it('removes from middle of second word', function () {
      expect(lib.removeNextWord({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 7}
      })).toEqual({
        lines: ['abcd ef'],
        cursor: {row: 0, column: 7}
      });
    });

    it('removes from middle of first word', function () {
      expect(lib.removeNextWord({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 2}
      })).toEqual({
        lines: ['abefgh'],
        cursor: {row: 0, column: 2}
      });
    });

    it('removes from beginning of second word', function () {
      expect(lib.removeNextWord({
        lines: ['abcd efgh'],
        cursor: {row: 0, column: 5}
      })).toEqual({
        lines: ['abcd '],
        cursor: {row: 0, column: 5}
      });
    });
  });
});
