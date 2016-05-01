export function get(key) {
  let result = window.localStorage.getItem(key);

  if (result) {
    try {
      result = JSON.parse(result);
    } catch (ex) {
      // we're okay with this
    }
  }
  return result;
}

export function set(key, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  window.localStorage.setItem(key, value);
}