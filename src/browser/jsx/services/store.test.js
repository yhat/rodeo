/* globals describe, it, expect, jest */

jest.mock('storage');

import lib from './store';
import MockStorage from 'storage';

describe(__filename, function () {
  let mockStorage;

  beforeEach(function () {
    mockStorage = new MockStorage();
  });

  afterEach(function () {
  });

  describe('get', function () {
    it('returns null when key is not found', function () {
      mockStorage.setStore({});
      const store = new lib.Store('a', mockStorage);

      expect(store.get('hi')).toEqual(null);
    });

    it('returns string when key with string is found', function () {
      mockStorage.setStore({thing: 'thing value'});
      const store = new lib.Store('a', mockStorage);

      expect(store.get('thing')).toEqual('thing value');
    });

    it('returns object when key with string is JSON', function () {
      mockStorage.setStore({thing: '{}'});
      const store = new lib.Store('a', mockStorage);

      expect(store.get('thing')).toEqual({});
    });

    it('throws if key is not camelCase', function () {
      expect(function () {
        lib.get('hey there');
      }).toThrow();
    });
  });

  describe('set', function () {
    it('returns undefined', function () {
      const store = new lib.Store('a', mockStorage);

      expect(store.set('hi', 'hi again')).toEqual(undefined);
    });

    it('sets key with value', function () {
      let store, data = {};

      mockStorage.setStore(data);
      store = new lib.Store('a', mockStorage);

      store.set('thing', 'thing value');
      expect(data).toEqual({thing: 'thing value'});
    });

    it('converts objects to JSON', function () {
      let store, data = {};

      mockStorage.setStore(data);
      store = new lib.Store('a', mockStorage);

      store.set('thing', {a: 'b'});
      expect(data).toEqual({thing: '{"a":"b"}'});
    });

    it('throws if key is not camelCase', function () {
      const store = new lib.Store('a', mockStorage);

      expect(function () {
        store.set('hey there');
      }).toThrow();
    });
  });
});
