import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'ace';
import './ace-pane.css';
import _ from 'lodash';
import { send } from 'ipc';
import aceSettings from '../../services/ace-settings';
import commonReact from '../../services/common-react';
import globalObserver from '../../services/global-observer';

export default React.createClass({
  displayName: 'AcePane',
  propTypes: {
    commands: React.PropTypes.array,
    disabled: React.PropTypes.bool,
    filename: React.PropTypes.string,
    fontSize: React.PropTypes.number.isRequired,
    highlightLine: React.PropTypes.bool.isRequired,
    id: React.PropTypes.string,
    initialValue: React.PropTypes.string,
    keyBindings: React.PropTypes.string.isRequired,
    mode: React.PropTypes.string.isRequired,
    onCommand: React.PropTypes.func,
    onLoadError: React.PropTypes.func.isRequired,
    onLoaded: React.PropTypes.func.isRequired,
    onLoading: React.PropTypes.func.isRequired,
    tabSize: React.PropTypes.number.isRequired,
    theme: React.PropTypes.string.isRequired,
    useSoftTabs: React.PropTypes.bool.isRequired
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
      readOnly: false
    };
  },
  componentDidMount: function () {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this));

    aceSettings.applyStaticSettings(instance);
    aceSettings.applyDynamicSettings(instance, props);

    // add each command
    _.each(props.commands, command => {
      command = _.clone(command);

      // if name already exists, reuse that command, bind the key
      if (instance.commands.byName[command.name]) {
        instance.commands.bindKey(command.bindKey, instance.commands.byName[command.name]);
      } else { // if name doesn't exist, link to our version
        command.exec = editor => props.onCommand(command, editor);
        instance.commands.addCommand(command);
      }
    });

    globalObserver.on('resize', this.resize, this);

    _.defer(() => instance.resize());

    // if filename, load filename into instance
    this.loadContentFromFile();
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
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
    const className = commonReact.getClassNameList(this);

    className.push('font-monospaced');

    return <div className={className.join(' ')} id={this.props.id}></div>;
  }
});

