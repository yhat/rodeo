import React from 'react';
import {connect} from 'react-redux';
import SplitPane from '../../components/split-pane/split-pane.jsx';
import TabbedPane from '../../components/tabbed-pane/tabbed-pane.jsx';
import TabbedPaneItem from '../../components/tabbed-pane/tabbed-pane-item.jsx';
import EditorTabGroup from '../../containers/editor-tab-group/editor-tab-group.jsx';
import Terminal from '../terminal/terminal.jsx';
import FreeTabGroup from '../../containers/free-tab-group/free-tab-group.jsx';
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
    onInterrupt: () => dispatch(terminalActions.interrupt()),
    onTerminalStart: (jqConsole) => dispatch(terminalActions.startPrompt(jqConsole)),
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
      isFocusable = !props.modalDialogs.length;

    return (
      <SplitPane direction="left-right" id="split-pane-center">
        <SplitPane direction="top-bottom" id="split-pane-left" onDrag={props.onSplitPaneDrag}>
          <EditorTabGroup focusable={isFocusable} id="top-left"/>
          <TabbedPane focusable={isFocusable}>

            {props.terminals.map(function (item) {
              return (
                <TabbedPaneItem icon="terminal" id={item.tabId} key={item.id} label="Console">
                  <Terminal
                    key={item.id}
                    onInterrupt={props.onInterrupt}
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
