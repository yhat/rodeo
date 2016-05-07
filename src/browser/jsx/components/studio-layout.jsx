import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import SplitPane from './split-pane/split-pane.jsx';
import TabbedPane from './tabbed-pane/tabbed-pane.jsx';
import FileViewer from './file-viewer/file-viewer.jsx';
import PlotViewer from './plot-viewer/plot-viewer.jsx';
import PackageViewer from './package-viewer.jsx';
import PreferenceViewer from './preference-viewer.jsx';
import EnvironmentViewer from './environment-viewer.jsx';
import HistoryViewer from './history-viewer.jsx';
import TabbedPaneItem from './tabbed-pane/tabbed-pane-item.jsx';
import AcePane from './ace-pane/ace-pane.jsx';
import Terminal from './terminal/terminal.jsx';
import './studio-layout.less';
import _ from 'lodash';
import { getParentNodeOf } from '../services/dom';
import { executeActiveFileInActiveConsole } from '../actions/kernel';
import { execute } from '../actions/kernel';

/**
 * @param {Element} el
 */
function focusAcePaneInActiveElement(el) {
  const activeAcePane = el.querySelector('.active .ace-pane');

  if (activeAcePane) {
    AcePane.focusByElement(activeAcePane);
  }
}

function mapStateToProps(state) {
  return _.pick(state, ['acePanes', 'splitPanes', 'terminals']);
}

function mapDispatchToProps(dispatch) {
  return {
    onAddAcePane: () => dispatch({ type: 'ADD_FILE' }),
    onFocusAcePane: (id) => dispatch({ type: 'FOCUS_FILE', id: id }),
    onRemoveAcePane: (id) => dispatch({ type: 'CLOSE_FILE', id: id }),
    onRunActiveAcePane: () => dispatch(executeActiveFileInActiveConsole),
    onSplitPaneDrag: () => dispatch({ type: 'SPLIT_PANE_DRAG' }),
    onCommand: (text, id) => dispatch(execute(text, id))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'StudioLayout',
  propTypes: {
    onAddAcePane: React.PropTypes.func,
    onFocusAcePane: React.PropTypes.func,
    onRemoveAcePane: React.PropTypes.func,
    onSplitPaneDrag: React.PropTypes.func,
    panePositions: React.PropTypes.object
  },
  handleEditorTabClose: function (tabId) {
    const targetPane = _.find(this.props.acePanes, {tabId});

    if (this.props.onRemoveAcePane) {
      this.props.onRemoveAcePane(targetPane.id);
    }
  },
  handleEditorTabChanged: function (oldTabId, newTabId) {
    // find the active ace-pane, and focus on it
    const props = this.props,
      editorTabs = ReactDOM.findDOMNode(this.refs.editorTabs),
      newPane = _.find(props.acePanes, {tabId: newTabId});

    if (this.props.onFocusAcePane) {
      this.props.onFocusAcePane(newPane.id);
    }

    // if there is an active editor tab, focus on the ace pane inside of it
    focusAcePaneInActiveElement(editorTabs);
  },
  handleTabDragStart: function (event, key) {
    const targetEl = getParentNodeOf(event.target, 'li'),
      targetAcePane = _.find(this.state.acePanes, {id: key});

    // prevent default in this case means to _deny_ the start of the drag
    // event.preventDefault();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', targetEl.outerHTML);
    event.dataTransfer.setData('rodeo/cid', key);

    // if the tab has a place where it is saved
    if (targetAcePane.path) {
      event.dataTransfer.setData('text/uri-list', targetAcePane.path);
      event.dataTransfer.setData('text/plain', targetAcePane.path);
    }
  },
  handleTabListDragOver: (event) => event.preventDefault(),
  handleTabListDrop: function (event) {
    const targetEl = getParentNodeOf(event.target, 'li'),
      targetId = targetEl && targetEl.getAttribute('data-child'),
      targetAcePane = _.find(this.state.acePanes, {id: targetId}),
      sourceId = event.dataTransfer.getData('rodeo/cid'),
      sourceAcePane = _.find(this.state.acePanes, {id: sourceId});

    let panes = _.without(this.state.acePanes, sourceAcePane),
      targetIndex = _.findIndex(panes, targetAcePane);

    if (sourceAcePane && targetIndex > -1) {
      panes.splice(targetIndex, 0, sourceAcePane);
    } else {
      panes.push(sourceAcePane);
    }

    this.setState({acePanes: panes});
  },
  handleTabListDragEnter: function (event) {
    // accept all
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  },
  render: function () {
    let acePanes, terminals,
      props = this.props;

    acePanes = this.props.acePanes.map(function (item) {
      return (
        <TabbedPaneItem icon={item.icon} id={item.tabId} isCloseable key={item.id} label={item.label} selected={item.hasFocus}>
          <AcePane key={item.id} {...item}/>
        </TabbedPaneItem>
      );
    });

    terminals = this.props.terminals.map(function (item) {
      return (
        <TabbedPaneItem icon="terminal" id={item.tabId} key={item.id} label="Console">
          <Terminal key={item.id} onCommand={props.onCommand} {...item} />
        </TabbedPaneItem>
      );
    });

    return (
      <SplitPane direction="left-right" id="split-pane-center">
        <SplitPane direction="top-bottom" id="split-pane-left" onDrag={props.onSplitPaneDrag}>
          <TabbedPane
            onChanged={this.handleEditorTabChanged}
            onTabClose={this.handleEditorTabClose}
            onTabDragStart={this.handleTabDragStart}
            onTabListDragEnter={this.handleTabListDragEnter}
            onTabListDragOver={this.handleTabListDragOver}
            onTabListDrop={this.handleTabListDrop}
            ref="editorTabs"
          >

            {acePanes}

            <a onClick={props.onAddAcePane}><span className="fa fa-plus-square-o"/></a>
            <a onClick={props.onRunActiveAcePane} title="Run script"><span className="fa fa-play-circle" /></a>
          </TabbedPane>
          <TabbedPane>

            {terminals}

          </TabbedPane>
        </SplitPane>
        <SplitPane direction="top-bottom"  id="split-pane-right">
          <TabbedPane>

            <TabbedPaneItem icon="table" label="Environment"><EnvironmentViewer /></TabbedPaneItem>
            <TabbedPaneItem icon="history" label="History"><HistoryViewer /></TabbedPaneItem>

          </TabbedPane>
          <TabbedPane>

            <TabbedPaneItem icon="file-text-o" label="Files"><FileViewer /></TabbedPaneItem>
            <TabbedPaneItem icon="bar-chart" label="Plots"><PlotViewer /></TabbedPaneItem>
            <TabbedPaneItem icon="archive" label="Packages"><PackageViewer /></TabbedPaneItem>
            <TabbedPaneItem icon="cogs" label="Preferences"><PreferenceViewer /></TabbedPaneItem>

          </TabbedPane>
        </SplitPane>
      </SplitPane>
    );
  }
}));
