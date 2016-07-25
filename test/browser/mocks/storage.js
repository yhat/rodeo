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

export default MockStorage;
