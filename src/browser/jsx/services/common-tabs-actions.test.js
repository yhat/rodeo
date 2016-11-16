/* globals describe, it, expect, jest */

jest.mock('./jupyter/client');

import Immutable from 'seamless-immutable';
import lib from './common-tabs-actions';

describe(__filename, function () {
  describe('isTabContentTypeInGroups', function () {
    it('returns false for empty groups', function () {
      const groups = Immutable([]),
        contentType = 'c';

      let result = lib.isTabContentTypeInGroups(contentType, groups);

      expect(result).toEqual(false);
    });

    it('returns false for empty tabs', function () {
      const groups = Immutable([{tabs: []}]),
        contentType = 'c';

      let result = lib.isTabContentTypeInGroups(contentType, groups);

      expect(result).toEqual(false);
    });

    it('returns false for tab with non-matching contentType', function () {
      const groups = Immutable([{tabs: [{contentType: 'b'}]}]),
        contentType = 'c';

      let result = lib.isTabContentTypeInGroups(contentType, groups);

      expect(result).toEqual(false);
    });

    it('returns true for tab with matching contentType', function () {
      const groups = Immutable([{tabs: [{contentType: 'c'}]}]),
        contentType = 'c';

      let result = lib.isTabContentTypeInGroups(contentType, groups);

      expect(result).toEqual(true);
    });
  });

  describe('isTabContentTypeInWindowList', function () {
    it('returns false for empty groups', function () {
      const windowList = Immutable([]),
        tabGroupName = 'someTabGroup',
        contentType = 'c';

      let result = lib.isTabContentTypeInWindowList(contentType, windowList, tabGroupName);

      expect(result).toEqual(false);
    });

    it('returns false for empty groups', function () {
      const windowList = Immutable([{someTabGroup: []}]),
        tabGroupName = 'someTabGroup',
        contentType = 'c';

      let result = lib.isTabContentTypeInWindowList(contentType, windowList, tabGroupName);

      expect(result).toEqual(false);
    });

    it('returns true for tab with matching contentType', function () {
      const windowList = Immutable([{someTabGroup: [{tabs: [{contentType: 'c'}]}]}]),
        tabGroupName = 'someTabGroup',
        contentType = 'c';

      let result = lib.isTabContentTypeInWindowList(contentType, windowList, tabGroupName);

      expect(result).toEqual(true);
    });
  });
});
