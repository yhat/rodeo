const dict = {
  'ace/autocomplete': {
    AutoComplete: {startCommand: {exec: function () {}}}
  }
};

function require(key) {
  return dict[key];
}

function edit() {
  return {
    getSession: function () {
      return {
        setValue: function () {

        }
      };
    }
  };
}

export default {
  require,
  edit
};
