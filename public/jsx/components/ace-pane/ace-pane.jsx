import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'ace';
import './ace-pane.less';
import _ from 'lodash';
import { send } from '../../services/ipc';

export default React.createClass({
  displayName: 'AcePane',
  propTypes: {
    filename: React.PropTypes.string,
    content: React.PropTypes.string,
    fontSize: React.PropTypes.number,
    id: React.PropTypes.string,
    keyBindings: React.PropTypes.string,
    mode: React.PropTypes.string,
    theme: React.PropTypes.string,
    onLoading: React.PropTypes.func,
    onLoaded: React.PropTypes.func,
    onLoadError: React.PropTypes.func
  },
  statics: {
    resizeAll: function () {
      _.each(document.querySelectorAll('.ace-pane'), function (el) {
        ace.edit(el).resize();
      });
    },
    /**
     * @param {Element} el
     */
    focusByElement: function (el) {
      ace.edit(el).focus();
    }
  },
  getDefaultProps: function () {
    return {
      fontSize: 12,
      keyBindings: 'default',
      theme: 'chrome',
      mode: 'python',
      onLoading: _.noop,
      onLoaded: _.noop,
      onLoadError: _.noop
    };
  },
  componentDidMount: function () {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this)),
      keyBindings = props.keyBindings,
      theme = props.theme,
      fontSize = props.fontSize,
      mode = props.mode,
      filename = props.filename;
    let session, langTools;

    langTools = ace.require('ace/ext/language_tools');
    langTools.setCompleters([]);

    instance.setKeyboardHandler(keyBindings === 'default' ? null : keyBindings);
    instance.setTheme('ace/theme/' + theme);
    instance.setFontSize(fontSize);
    session = instance.getSession();
    session.setMode('ace/mode/' + mode);
    instance.setOptions({
      useSoftTabs: true,
      showPrintMargin: false,
      enableBasicAutocompletion: true,
      enableSnippets: false,
      enableLiveAutocompletion: false
    });
    instance.$blockScrolling = Infinity;

    this.instance = instance;

    // if filename, load filename into instance
    if (filename) {
      props.onLoading();
      send('get_file', filename).then(function (content) {
        props.onLoaded();
        session.setValue(content);
      }).catch(function (error) {
        props.onLoadError(error);
      });
    }
  },
  focus: function () {
    this.instance.focus();
  },
  render: function () {
    return (
      <div className="ace-pane" id={this.props.id}></div>
    );
  }
});

