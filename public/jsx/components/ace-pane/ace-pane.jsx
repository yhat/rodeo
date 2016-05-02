import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ace from 'ace';
import './ace-pane.less';
import _ from 'lodash';

export default React.createClass({
  displayName: 'AcePane',
  propTypes: {
    filename: React.PropTypes.string,
    fontSize: React.PropTypes.string,
    keyBindings: React.PropTypes.string,
    mode: React.PropTypes.string,
    theme: React.PropTypes.string
  },
  statics: {
    resizeAll: function () {
      _.each(document.querySelectorAll('.ace-pane'), function (el) {
        ace.edit(el).resize();
      });
    }
  },
  getDefaultProps: function () {
    return {
      fontSize: 12,
      keyBindings: 'default',
      theme: 'chrome',
      mode: 'python'
    };
  },
  componentDidMount: function () {
    const instance = ace.edit(ReactDOM.findDOMNode(this)),
      keyBindings = this.props.keyBindings,
      theme = this.props.theme,
      fontSize = this.props.fontSize,
      mode = this.props.mode;
    let langTools = ace.require('ace/ext/language_tools');

    langTools.setCompleters([]);

    instance.setKeyboardHandler(keyBindings === 'default' ? null : keyBindings);
    instance.setTheme('ace/theme/' + theme);
    instance.setFontSize(fontSize);
    instance.getSession().setMode('ace/mode/' + mode);
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

