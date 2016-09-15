import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'ace';
import './ace-pane.css';
import _ from 'lodash';
import { send } from 'ipc';
import aceShortcuts from '../../services/ace-shortcuts';
import aceSettings from '../../services/ace-settings';
import commonReact from '../../services/common-react';
import globalObserver from '../../services/global-observer';

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
    initialValue: React.PropTypes.string,
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
    theme: React.PropTypes.string,
    useSoftTabs: React.PropTypes.bool
  },
  statics: {
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
      tabSize: 4,
      useSoftTabs: true
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
    aceShortcuts.autocomplete(instance);
    aceShortcuts.liftSelection(instance, props.onLiftSelection);
    aceShortcuts.liftFile(instance, props.onLiftFile);
    aceShortcuts.openPreferences(instance, props.onOpenPreferences);

    globalObserver.on('resize', this.resize, this);

    _.defer(() => instance.resize());

    // if filename, load filename into instance
    this.loadContentFromFile();
  },
  shouldComponentUpdate(nextProps, nextState) {
    return !commonReact.shallowEqual(this, nextProps, nextState);
  },
  componentDidUpdate: function (oldProps) {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this));

    aceSettings.applyDynamicSettings(instance, props, oldProps);
  },
  componentWillUnmount: function () {
    globalObserver.off(null, null, this);
  },
  focus: function () {
    const instance = ace.edit(ReactDOM.findDOMNode(this));

    _.defer(() =>instance.focus());
  },
  resize: function () {
    const instance = ace.edit(ReactDOM.findDOMNode(this));

    instance.resize();
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
    } else if (props.initialValue) {
      session.setValue(props.initialValue);
    }
  },
  render: function () {
    return <div className="ace-pane" id={this.props.id}></div>;
  }
});

