import React from 'react';
import {connect} from 'react-redux';
import SplitPane from '../../components/split-pane/split-pane.jsx';
import EditorTabGroup from '../../containers/editor-tab-group/editor-tab-group.jsx';
import TerminalTabGroup from '../../containers/terminal-tab-group/terminal-tab-group.jsx';
import FreeTabGroup from '../../containers/free-tab-group/free-tab-group.jsx';
import './studio-layout.css';
import splitPaneActions from '../../components/split-pane/split-pane.actions';
import editorTabGroupActions from '../../containers/editor-tab-group/editor-tab-group.actions';
import dialogActions from '../../actions/dialogs';
import kernelActions from '../../actions/kernel';
import terminalActions from '../terminal-tab-group/terminal-tab-group.actions';

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
export default connect(state => state, mapDispatchToProps)(React.createClass({
  displayName: 'StudioLayout',
  shouldComponentUpdate: function (nextProps) {
    return this.props !== nextProps;
  },
  render: function () {
    let props = this.props,
      runClearTerminalBuffer = 'Ctrl + L',
      runTerminalInterrupt = 'Ctrl + C',
      runTerminalRestart = process.platform === 'darwin' ? '⌘ + R' : 'Alt + R',
      isFocusable = !props.modalDialogs.length;

    return (
      <SplitPane direction="left-right" id="split-pane-center">
        <SplitPane direction="top-bottom" id="split-pane-left">
          <EditorTabGroup focusable={isFocusable} id="top-left"/>
          <TerminalTabGroup focusable={isFocusable} id="bottom-left"/>
        </SplitPane>
        <SplitPane direction="top-bottom" id="split-pane-right">
          <FreeTabGroup focusable={isFocusable} id="top-right"/>
          <FreeTabGroup focusable={isFocusable} id="bottom-right"/>
        </SplitPane>
      </SplitPane>
    );
  }
}));
