import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import SplitPane from '../../components/split-pane/split-pane.jsx';
import TabbedPane from '../../components/tabbed-pane/tabbed-pane.jsx';
import FileViewer from '../file-viewer/file-viewer.jsx';
import PlotViewer from '../../components/plot-viewer/plot-viewer.jsx';
import PackageViewer from '../package-viewer.jsx';
import VariableViewer from '../variable-viewer.jsx';
import HistoryViewer from '../history-viewer.jsx';
import TabbedPaneItem from '../../components/tabbed-pane/tabbed-pane-item.jsx';
import AcePane from '../../components/ace-pane/ace-pane.jsx';
import Terminal from '../terminal/terminal.jsx';
import SearchTextBox from '../../components/search-text-box/search-text-box.jsx';
import './studio-layout.css';
import _ from 'lodash';
import { getParentNodeOf } from '../../services/dom';
import kernelActions from '../../actions/kernel';
import splitPaneActions from '../../components/split-pane/split-pane.actions';
import acePaneActions from '../../components/ace-pane/ace-pane.actions';
import dialogActions from '../../actions/dialogs';

/**
 * @param {Element} el
 */
function focusAcePaneInActiveElement(el) {
  const activeAcePane = el.querySelector('.active .ace-pane');

  if (activeAcePane) {
    AcePane.focusByElement(activeAcePane);
  }
}

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
    onAddAcePane: () => dispatch(acePaneActions.addFile()),
    onFocusAcePane: (id) => dispatch(acePaneActions.focusFile(id)),
    onRemoveAcePane: (id) => dispatch(acePaneActions.closeFile(id)),
    onRunActiveAcePane: () => dispatch(kernelActions.executeActiveFileInActiveConsole()),
    onSplitPaneDrag: () => dispatch(splitPaneActions.splitPaneDrag()),
    onCommand: (text, id) => dispatch(kernelActions.execute(text, id)),
    onRodeo: () => dispatch(dialogActions.showAboutRodeo())
  };
}

/**
 * @class StudioLayout
 * @extends ReactComponent
 * @property props
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'StudioLayout',
  propTypes: {
    onAddAcePane: React.PropTypes.func,
    onCommand: React.PropTypes.func,
    onFocusAcePane: React.PropTypes.func,
    onRemoveAcePane: React.PropTypes.func,
    onRodeo: React.PropTypes.func,
    onSplitPaneDrag: React.PropTypes.func
  },
  getInitialState: function () {
    return {
      topRightSearch: '',
      bottomRightSearch: ''
    };
  },
  handleEditorTabClose: function (tabId) {
    const targetPane = _.find(this.props.acePanes, {tabId});

    if (this.props.onRemoveAcePane) {
      this.props.onRemoveAcePane(targetPane.id);
    }
  },
  handleEditorTabChanged: function (oldTabId, newTabId) {
    // todo: remove 'refs', we can find it by id instead
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
      targetAcePane = _.find(this.props.acePanes, {id: key});

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
      targetAcePane = _.find(this.props.acePanes, {id: targetId}),
      sourceId = event.dataTransfer.getData('rodeo/cid'),
      sourceAcePane = _.find(this.props.acePanes, {id: sourceId});

    let panes = _.without(this.props.acePanes, sourceAcePane),
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
      props = this.props,
      isFocusable = !props.modalDialogs.length;

    acePanes = this.props.acePanes.map(function (item) {
      return (
        <TabbedPaneItem hasFocus={item.hasFocus} icon={item.icon} id={item.tabId} isCloseable key={item.id} label={item.label}>
          <AcePane
            disabled={!isFocusable}
            key={item.id}
            onExecuteFile={props.onRunActiveAcePane}
            onExecuteLine={props.onRunActiveAcePane}
            onExecuteSelection={props.onRunActiveAcePane}
            {...item}
          />
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
            focusable={isFocusable}
            onChanged={this.handleEditorTabChanged}
            onTabClose={this.handleEditorTabClose}
            onTabDragStart={this.handleTabDragStart}
            onTabListDragEnter={this.handleTabListDragEnter}
            onTabListDragOver={this.handleTabListDragOver}
            onTabListDrop={this.handleTabListDrop}
            ref="editorTabs"
          >
            <li><a className="icon-overflowing not-tab" onClick={props.onRodeo}><span /></a></li>
            <li className="right">
              <a className="not-tab" onClick={props.onAddAcePane}>
                <span className="fa fa-plus-square-o"/>
              </a>
            </li>
            <li className="right">
              <a className="not-tab" onClick={props.onRunActiveAcePane} title="Run script">
                <span className="fa fa-play-circle" />
              </a>
            </li>

            {acePanes}

          </TabbedPane>
          <TabbedPane focusable={isFocusable}>

            {terminals}

          </TabbedPane>
        </SplitPane>
        <SplitPane direction="top-bottom" id="split-pane-right">
          <TabbedPane focusable={isFocusable}>

            <li className="right">
              <SearchTextBox onChange={(topRightSearch) => this.setState({topRightSearch})} />
            </li>
            <TabbedPaneItem icon="table" label="Environment"><VariableViewer filter={this.state.topRightSearch} /></TabbedPaneItem>
            <TabbedPaneItem icon="history" label="History"><HistoryViewer filter={this.state.topRightSearch} /></TabbedPaneItem>


          </TabbedPane>
          <TabbedPane focusable={isFocusable}>

            <li className="right">
              <SearchTextBox onChange={(bottomRightSearch) => this.setState({bottomRightSearch})}/>
            </li>
            <TabbedPaneItem icon="file-text-o" label="Files"><FileViewer filter={this.state.bottomRightSearch}/></TabbedPaneItem>
            <TabbedPaneItem icon="bar-chart" label="Plots"><PlotViewer /></TabbedPaneItem>
            <TabbedPaneItem icon="archive" label="Packages"><PackageViewer filter={this.state.bottomRightSearch} /></TabbedPaneItem>

          </TabbedPane>
        </SplitPane>
      </SplitPane>
    );
  }
}));
