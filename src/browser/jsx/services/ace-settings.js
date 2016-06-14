import _ from 'lodash';
import ace from 'ace';
import pythonCompleter from './ace-python-completer';

const Autocomplete = ace.require('ace/autocomplete').Autocomplete,
  langTools = ace.require('ace/ext/language_tools');
let dynamicSettingMap;

dynamicSettingMap = {
  disabled: function (instance, value) {
    instance.textInput.getElement().disabled = value;
  },
  fontSize: function (instance, value) {
    instance.setFontSize(value);
  },
  keyBindings: function (instance, value) {
    instance.setKeyboardHandler('ace/keyboard/' + (value === 'default' ? null : value));
  },
  highlightLine: function (instance, value) {
    instance.setHighlightActiveLine(value);
  },
  mode: function (instance, value) {
    instance.getSession().setMode('ace/mode/' + value);
  },
  readOnly: function (instance, value) {
    instance.setReadOnly(value);
  },
  tabSize: function (instance, value) {
    instance.getSession().setTabSize(value);
  },
  theme: function (instance, value) {
    instance.setTheme('ace/theme/' + value);
  }
};

function setDynamicSettingMap(value) {
  dynamicSettingMap = value;
}

/**
 * @param {Editor} instance
 * @param {object} props
 * @param {object} [oldProps]
 */
function applyDynamicSettings(instance, props, oldProps) {
  _.each(dynamicSettingMap, function (fn, name) {
    if (!oldProps || props[name] !== oldProps[name]) {
      fn(instance, props[name]);
    }
  });
}

/**
 * @param {Editor} instance
 */
function applyStaticSettings(instance) {
  instance.completer = new Autocomplete(instance);
  /*
   These are available, you know.

   exports.textCompleter = textCompleter;
   exports.keyWordCompleter = keyWordCompleter;
   exports.snippetCompleter = snippetCompleter;
   */
  langTools.setCompleters([]);
  langTools.addCompleter(pythonCompleter);

  instance.setOptions({
    useSoftTabs: true,
    showPrintMargin: false,
    enableBasicAutocompletion: true,
    enableSnippets: false,
    enableLiveAutocompletion: true
  });
  instance.$blockScrolling = Infinity;
}

export default {
  applyDynamicSettings,
  applyStaticSettings,
  setDynamicSettingMap
};
