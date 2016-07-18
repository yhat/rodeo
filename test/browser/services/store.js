/* globals describe, it */
import { expect } from 'chai';
import lib from '../../../src/browser/jsx/services/store';
import sinon from 'sinon';
import MockStorage from '../../mocks/classes/storage';

describe(__filename, function () {
  let sandbox, mockStorage;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    mockStorage = new MockStorage();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('get', function () {
    it('returns null when key is not found', function () {
      mockStorage.setStore({});
      const store = new lib.Store(mockStorage);

      expect(store.get('hi')).to.equal(null);
    });

    it('returns string when key with string is found', function () {
      mockStorage.setStore({thing: 'thing value'});
      const store = new lib.Store(mockStorage);

      expect(store.get('thing')).to.equal('thing value');
    });

    it('returns object when key with string is JSON', function () {
      mockStorage.setStore({thing: '{}'});
      const store = new lib.Store(mockStorage);

      expect(store.get('thing')).to.deep.equal({});
    });

    it('throws if key is not camelCase', function () {
      expect(function () {
        lib.get('hey there');
      }).to.throw();
    });
  });

  describe('set', function () {
    it('returns undefined', function () {
      const store = new lib.Store(mockStorage);

      expect(store.set('hi', 'hi again')).to.equal(undefined);
    });

    it('sets key with value', function () {
      let store, data = {};

      mockStorage.setStore(data);
      store = new lib.Store(mockStorage);

      store.set('thing', 'thing value');
      expect(data).to.deep.equal({thing: 'thing value'});
    });

    it('converts objects to JSON', function () {
      let store, data = {};

      mockStorage.setStore(data);
      store = new lib.Store(mockStorage);

      store.set('thing', {a: 'b'});
      expect(data).to.deep.equal({thing: '{"a":"b"}'});
    });

    it('throws if key is not camelCase', function () {
      const store = new lib.Store(mockStorage);

      expect(function () {
        store.set('hey there');
      }).to.throw();
    });
  });
});
