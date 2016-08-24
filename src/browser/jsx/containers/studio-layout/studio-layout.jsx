import React from 'react';
import {connect} from 'react-redux';
import SplitPane from '../../components/split-pane/split-pane.jsx';
import TabbedPane from '../../components/tabbed-pane/tabbed-pane.jsx';
import TabbedPaneItem from '../../components/tabbed-pane/tabbed-pane-item.jsx';
import EditorTabGroup from '../../containers/editor-tab-group/editor-tab-group.jsx';
import Terminal from '../terminal/terminal.jsx';
import FreeTabGroup from '../../containers/free-tab-group/free-tab-group.jsx';
import TabText from '../../components/tab-text/tab-text.jsx';
import './studio-layout.css';
import _ from 'lodash';
import splitPaneActions from '../../components/split-pane/split-pane.actions';
import editorTabGroupActions from '../../containers/editor-tab-group/editor-tab-group.actions';
import dialogActions from '../../actions/dialogs';
import kernelActions from '../../actions/kernel';
import terminalActions from '../terminal/terminal.actions';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  return _.pick(state, ['acePanes', 'splitPanes', 'terminals', 'modalDialogs']);
}

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onAddAcePane: () => dispatch(editorTabGroupActions.addFile()),
    onTerminalInterrupt: () => dispatch(terminalActions.interrupt()),
    onTerminalAutoComplete: (code, cursorPos) => dispatch(terminalActions.autoComplete(code, cursorPos)),
    onTerminalStart: (jqConsole) => dispatch(terminalActions.startPrompt(jqConsole)),
    onTerminalRestart: () => dispatch(terminalActions.restart()),
    onTerminalClearBuffer: () => dispatch(terminalActions.clearBuffer()),
    onFocusAcePane: (id) => dispatch(editorTabGroupActions.focusFile(id)),
    onLiftText: (text, context) => dispatch(terminalActions.addInputText(context)),
    onOpenPreferences: () => dispatch(dialogActions.showPreferences()),
    onRemoveAcePane: (id) => dispatch(editorTabGroupActions.closeFile(id)),
    onRunActiveAcePane: () => dispatch(kernelActions.executeActiveFileInActiveConsole()),
    onRodeo: () => dispatch(dialogActions.showAboutRodeo()),
    onSplitPaneDrag: () => dispatch(splitPaneActions.splitPaneDrag())
  };
}

/**
 * @class StudioLayout
 * @extends ReactComponent
 * @property props
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'StudioLayout',
  getInitialState: function () {
    return {
      topRightSearch: '',
      bottomRightSearch: ''
    };
  },
  render: function () {
    let props = this.props,
      runClearTerminalBuffer = 'Ctrl + L',
      runTerminalInterrupt = 'Ctrl + C',
      runTerminalRestart = process.platform === 'darwin' ? '⌘ + R' : 'Alt + R',
      isFocusable = !props.modalDialogs.length;

    return (
      <SplitPane direction="left-right" id="split-pane-center">
        <SplitPane direction="top-bottom" id="split-pane-left" onDrag={props.onSplitPaneDrag}>
          <EditorTabGroup focusable={isFocusable} id="top-left"/>
          <TabbedPane focusable={isFocusable}>

            <li className="right">
              <a className="not-tab" onClick={props.onTerminalRestart} title={runTerminalRestart}>
                <span className="fa fa-refresh" />
                <span className="icon-text-right">{'Restart'}</span>
              </a>
            </li>
            <li className="right">
              <a className="not-tab" onClick={props.onTerminalInterrupt} title={runTerminalInterrupt}>
                <span className="fa fa-stop" />
                <span className="icon-text-right">{'Interrupt'}</span>
              </a>
            </li>
            <li className="right">
              <a className="not-tab" onClick={props.onTerminalClearBuffer} title={runClearTerminalBuffer}>
                <span className="fa fa-trash-o" />
                <span className="icon-text-right">{'Clear'}</span>
              </a>
            </li>

            <TabText>{props.terminals[0].cwd}</TabText>

            {props.terminals.map(function (item) {
              return (
                <TabbedPaneItem icon="terminal" id={item.tabId} key={item.id} label="Console">
                  <Terminal
                    focusable={isFocusable && !!item.cmd}
                    key={item.id}
                    onAutoComplete={props.onTerminalAutoComplete}
                    onClearBuffer={props.onTerminalClearBuffer}
                    onInterrupt={props.onTerminalInterrupt}
                    onStart={props.onTerminalStart}
                    {...item}
                  />
                </TabbedPaneItem>
              );
            })}

          </TabbedPane>
        </SplitPane>
        <SplitPane direction="top-bottom" id="split-pane-right">
          <FreeTabGroup focusable={isFocusable} id="top-right" />
          <FreeTabGroup focusable={isFocusable} id="bottom-right" />
        </SplitPane>
      </SplitPane>
    );
  }
}));
