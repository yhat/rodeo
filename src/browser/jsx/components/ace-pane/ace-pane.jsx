import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'ace';
import './ace-pane.less';
import _ from 'lodash';
import { send } from 'ipc';
import aceShortcuts from '../../services/ace-shortcuts';
import aceSettings from '../../services/ace-settings';

/**
 * @class AcePane
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'AcePane',
  propTypes: {
    disabled: React.PropTypes.bool,
    filename: React.PropTypes.string,
    fontSize: React.PropTypes.number,
    highlightLine: React.PropTypes.bool,
    id: React.PropTypes.string,
    keyBindings: React.PropTypes.string,
    mode: React.PropTypes.string,
    onInterrupt: React.PropTypes.func,
    onLiftFile: React.PropTypes.func,
    onLiftSelection: React.PropTypes.func,
    onLoadError: React.PropTypes.func,
    onLoaded: React.PropTypes.func,
    onLoading: React.PropTypes.func,
    onOpenPreferences: React.PropTypes.func,
    onSave: React.PropTypes.func,
    tabSize: React.PropTypes.number,
    theme: React.PropTypes.string
  },
  statics: {
    /**
     * @methodOf AcePane
     * @static
     */
    resizeAll: function () {
      _.each(document.querySelectorAll('.ace-pane'), function (el) {
        ace.edit(el).resize();
      });
    },
    /**
     * @param {Element} el
     * @methodOf AcePane
     * @static
     */
    focusByElement: function (el) {
      ace.edit(el).focus();
    }
  },
  getDefaultProps: function () {
    return {
      disabled: false,
      fontSize: 12,
      highlightLine: true,
      keyBindings: 'default',
      theme: 'chrome',
      mode: 'python',
      readOnly: false,
      onInterrupt: _.noop,
      onLiftSelection: _.noop,
      onLoading: _.noop,
      onLoaded: _.noop,
      onLoadError: _.noop,
      onSave: _.noop,
      tabSize: 4
    };
  },
  componentDidMount: function () {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this));

    aceSettings.applyStaticSettings(instance);
    aceSettings.applyDynamicSettings(instance, props);

    // indent selection
    aceShortcuts.indent(instance);
    aceShortcuts.interrupt(instance, props.onInterrupt);
    aceShortcuts.outdent(instance);
    aceShortcuts.saveFile(instance, props.onSave);
    aceShortcuts.autocomplete(instance, props.tabSize);
    aceShortcuts.liftSelection(instance, props.onLiftSelection);
    aceShortcuts.liftFile(instance, props.onLiftFile);
    aceShortcuts.openPreferences(instance, props.onOpenPreferences);

    _.defer(() => instance.resize());

    // if filename, load filename into instance
    this.loadContentFromFile();
  },
  componentDidUpdate: function (oldProps) {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this));

    aceSettings.applyDynamicSettings(instance, props, oldProps);
  },
  focus: function () {
    const instance = ace.edit(ReactDOM.findDOMNode(this));

    _.defer(() =>instance.focus());
  },
  loadContentFromFile: function () {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this)),
      session = instance.getSession();

    if (props.filename) {
      props.onLoading();
      send('getFile', props.filename).then(function (content) {
        props.onLoaded();
        session.setValue(content);
      }).catch(function (error) {
        props.onLoadError(error);
      });
    }
  },
  render: function () {
    return (
      <div className="ace-pane" id={this.props.id}></div>
    );
  }
});

