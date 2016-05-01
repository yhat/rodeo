import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'ace';
import './ace-pane.less';

export default React.createClass({
  displayName: 'AcePane',
  propTypes: {
    filename: React.PropTypes.string,
    fontSize: React.PropTypes.string,
    keyBindings: React.PropTypes.string,
    mode: React.PropTypes.string,
    theme: React.PropTypes.string
  },
  componentDidMount: function () {
    const instance = ace.edit(ReactDOM.findDOMNode(this)),
      keyBindings = this.props.keyBindings,
      theme = this.props.theme,
      fontSize = this.props.fontSize;
    let langTools = ace.require('ace/ext/language_tools');

    langTools.setCompleters([]);

    instance.setKeyboardHandler(keyBindings === 'default' ? null : keyBindings);
    instance.setTheme(theme || 'ace/theme/chrome');
    instance.setFontSize(fontSize || 12);
    instance.getSession().setMode('ace/mode/python');
    instance.setOptions({
      useSoftTabs: true,
      showPrintMargin: false,
      enableBasicAutocompletion: true,
      enableSnippets: false,
      enableLiveAutocompletion: false
    });
    instance.$blockScrolling = Infinity;

    this.instance = instance;
  },
  render: function () {
    return (
      <div className="ace-pane"></div>
    );
  }
});