
function getSelection() {
  return {
    containsNode: function () { return false; }
  };
}

Object.defineProperty(window, 'getSelection', {
  value: getSelection
});
