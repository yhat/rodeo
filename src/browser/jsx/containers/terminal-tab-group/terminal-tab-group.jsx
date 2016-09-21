import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabButton from '../../components/tabs/tab-button';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import Terminal from '../../components/terminal/terminal.jsx';
import GrayInfo from '../../components/gray-info/gray-info';
import GrayInfoLink from '../../components/gray-info/gray-info-link';
import actions from './terminal-tab-group.actions';
import commonReact from '../../services/common-react';
import './terminal-tab-group.css';

/**
 * @param {function} dispatch
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId;

  return {
    onFocusTab: id => dispatch(actions.focus(groupId, id)),
    onInterrupt: id => dispatch(actions.interrupt(groupId, id)),
    onAutoComplete: id => dispatch(actions.autoComplete(groupId, id)),
    onStart: id => dispatch(actions.startPrompt(groupId, id)),
    onRestart: id => dispatch(actions.restart(groupId, id)),
    onDetectVariables: () => dispatch(actions.detectVariables()),
    onClearBuffer: id => dispatch(actions.clearBuffer(groupId, id)),
    onRestartActiveTerminal: () => dispatch(actions.restartActiveTab(groupId)),
    onInterruptActiveTerminal: () => dispatch(actions.interruptActiveTab(groupId)),
    onClearBufferActiveTerminal: () => dispatch(actions.clearBufferOfActiveTab(groupId)),
    onShowSelectWorkingDirectoryDialog: id => dispatch(actions.showSelectWorkingDirectoryDialog(groupId, id))
  };
}

/**
 * @class FreeTabGroup
 * @extends ReactComponent
 * @property props
 * @property state
 */
export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'TerminalTabGroup',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool,
    groupId: React.PropTypes.string.isRequired,
    tabs: React.PropTypes.array.isRequired
  },
  componentDidMount: function () {
    this.props.onDetectVariables();
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleNoop: _.noop,
  render: function () {
    const props = this.props,
      runClearTerminalBuffer = 'Ctrl + L',
      runTerminalInterrupt = 'Ctrl + C',
      runTerminalRestart = process.platform === 'darwin' ? '⌘ + R' : 'Alt + R',
      types = {
        terminal: tab => (
          <Terminal
            disabled={props.disabled}
            onAutoComplete={_.partial(props.onAutoComplete, tab.id)}
            onClearBuffer={_.partial(props.onClearBuffer, tab.id)}
            onInterrupt={_.partial(props.onInterrupt, tab.id)}
            onStart={_.partial(props.onStart, tab.id)}
            {...tab.content}
          />
        )
      };

    return (
      <TabbedPane
        focusable={!props.disabled}
        onTabClick={props.onFocusTab}
        onTabClose={this.handleNoop}
        onTabDragEnd={this.handleNoop}
        onTabDragStart={this.handleNoop}
        onTabListDragEnter={this.handleNoop}
        onTabListDragLeave={this.handleNoop}
        onTabListDragOver={this.handleNoop}
        onTabListDrop={this.handleNoop}
        {...props}
      >
        <TabButton
          className="right"
          icon="refresh"
          label="Restart"
          onClick={props.onRestartActiveTerminal}
          title={runTerminalRestart}
        />
        <TabButton
          className="right"
          icon="stop"
          label="Interrupt"
          onClick={props.onInterruptActiveTerminal}
          title={runTerminalInterrupt}
        />
        <TabButton
          className="right"
          icon="trash-o"
          label="Clear"
          onClick={props.onClearBufferActiveTerminal}
          title={runClearTerminalBuffer}
        />

        {props.tabs.map(function (tab) {
          return (
            <TabbedPaneItem key={tab.id}{...tab}>
              {types[tab.contentType](tab)}
              <GrayInfo content={tab.content}>
                <GrayInfoLink
                  cwd={tab.content.cwd}
                  onClick={_.partial(props.onShowSelectWorkingDirectoryDialog, tab.id)}
                >{tab.content.cwd}</GrayInfoLink>
              </GrayInfo>
            </TabbedPaneItem>
          );
        })}
      </TabbedPane>
    );
  }
}));
