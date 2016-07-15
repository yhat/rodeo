class MockStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  clear() {
    this.store = {};
  }

  setStore(value) {
    this.store = value;
  }

  getStore() {
    return this.store;
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new MockStorage()
});

Object.defineProperty(window, 'sessionStorage', {
  value: new MockStorage()
});

export default MockStorage;
