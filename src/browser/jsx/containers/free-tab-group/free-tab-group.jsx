import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import DatabaseViewer from '../database-viewer/database-viewer';
import SearchTextBox from '../../components/search-text-box/search-text-box.jsx';
import HistoryViewer from '../../components/history/history-viewer.jsx';
import PlotViewer from '../plot-viewer/plot-viewer.jsx';
import FileViewer from '../file-viewer/file-viewer.jsx';
import VariableViewer from '../../components/variable-viewer/variable-viewer.jsx';
import VariableTableViewer from '../variable-table-viewer.jsx';
import PackageViewer from '../package-viewer/package-viewer.jsx';
import PackageSearchViewer from '../package-search-viewer/package-search-viewer.jsx';
import TerminalViewer from '../terminal-viewer/terminal-viewer';
import ActionestButton from '../../components/actionest/actionest-button';
import {getParentNodeOf} from '../../services/dom';
import freeTabActions from './free-tab-group.actions';
import terminalViewerActions from '../terminal-viewer/terminal-viewer.actions';
import commonReact from '../../services/common-react';

const allowedPopoutTypes = ['plot-viewer', 'terminal-viewer', 'environment'];

function isPopoutAllowed(props) {
  const activeIndex = _.findIndex(props.tabs, {id: props.active});

  if (activeIndex > -1) {
    const contentType = props.tabs[activeIndex].contentType;

    return allowedPopoutTypes.indexOf(contentType) > -1;
  }

  return false;
}

/**
 * @param {function} dispatch
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId;

  return {
    onBlockRemove: (id, blockId) => dispatch(terminalViewerActions.removeHistoryBlock(groupId, id, blockId)),
    onCloseTab: id => dispatch(freeTabActions.closeTab(groupId, id)),
    onCopyToPrompt: (id, details) => dispatch(terminalViewerActions.copyToPrompt(groupId, id, details)),
    onPromptExecute: (id, context) => dispatch(terminalViewerActions.execute(groupId, id, context)),
    onFocusTab: id => dispatch(freeTabActions.focusTab(groupId, id)),
    onMoveTab: id => dispatch(freeTabActions.moveTab(groupId, id)),
    onPopActiveTab: () => dispatch(freeTabActions.popActiveTab(groupId)),
    onInstallPythonModule: (id, moduleName) => dispatch(terminalViewerActions.installPythonModule(groupId, id, moduleName)),
    onShowDataFrame: item => dispatch(freeTabActions.showDataFrame(groupId, item)),
    onFocusPlot: (id, plot) => dispatch(freeTabActions.focusPlot(groupId, id, plot)),
    onReRunHistoryBlock: (id, blockId) => dispatch(terminalViewerActions.reRunHistoryBlock(groupId, id, blockId)),
    onRemovePlot: (id, plot) => dispatch(freeTabActions.removePlot(groupId, id, plot)),
    onSavePlot: plot => dispatch(freeTabActions.savePlot(plot))
  };
}

/**
 * @class FreeTabGroup
 * @extends ReactComponent
 * @property props
 * @property state
 */
export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'FreeTabGroup',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool,
    groupId: React.PropTypes.string.isRequired,
    tabs: React.PropTypes.array.isRequired
  },
  getInitialState: function () {
    return {searchFilter: ''};
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    return commonReact.shouldComponentUpdate(this, nextProps, nextState);
  },
  handleTabClick: function (id, event) {
    event.preventDefault();
    this.props.onFocusTab(id);
  },
  handleTabClose: function (id, event) {
    event.preventDefault();
    this.props.onCloseTab(id);
  },
  /**
   * NOTE: preventDefault to reject drag
   * @param {string} id
   * @param {DragEvent} event
   */
  handleTabDragStart: function (id, event) {
    const el = getParentNodeOf(event.target, 'li'),
      tab = _.find(this.props.tabs, {id});

    if (tab) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', el.outerHTML);
      event.dataTransfer.setData('application/json', JSON.stringify(tab));
    } else {
      // prevent default in this case means to _deny_ the start of the drag
      event.preventDefault();
    }
  },
  /**
   * NOTE: preventDefault to allow drop
   * @param {DragEvent} event
   */
  handleTabListDragOver: function (event) {
    const itemStr = event.dataTransfer.getData('application/json');
    let item;

    if (_.isString(itemStr)) {
      try {
        item = JSON.parse(itemStr);
      } catch (ex) {
        console.error('handleTabListDragOver', ex);
      }
    }

    if (item) {
      event.preventDefault();
    }
  },
  handleTabListDragEnter: function (event) {
    // accept all
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  },
  handleTabListDragLeave: function (event) {
    console.log('handleTabListDragLeave', event);
  },
  handleTabListDrop: function (event) {
    const itemStr = event.dataTransfer.getData('application/json');
    let item;

    if (_.isString(itemStr)) {
      try {
        item = JSON.parse(itemStr);

        this.props.onMoveTab(item.id);
      } catch (ex) {
        console.log(ex);
      }
    }
  },
  handleTabDragEnd: function (event) {
    console.log('handleTabDragEnd', event);
  },
  render: function () {
    const props = this.props,
      state = this.state,
      filter = state.searchFilter,
      types = {
        'database-viewer': tab => (
          <DatabaseViewer
            filter={filter}
            groupId={props.groupId}
            id={tab.id}
            {...tab.content}
          />
        ),
        'history-viewer': tab => <HistoryViewer filter={filter} {...tab.content}/>,
        'file-viewer': tab => <FileViewer filter={filter} {...tab.content}/>,
        'package-search-viewer': tab => <PackageSearchViewer filter={filter} {...tab.content}/>,
        'package-viewer': tab => <PackageViewer filter={filter} {...tab.content}/>,
        'plot-viewer': tab => (
          <PlotViewer
            onFocusPlot={_.partial(props.onFocusPlot, tab.id)}
            onRemovePlot={_.partial(props.onRemovePlot, tab.id)}
            onSavePlot={props.onSavePlot}
            {...tab.content}
          />
        ),
        'terminal-viewer': tab => (
          <TerminalViewer
            filter={filter}
            onBlockRemove={_.partial(props.onBlockRemove, tab.id)}
            onCopyToPrompt={_.partial(props.onCopyToPrompt, tab.id)}
            onExecute={_.partial(props.onPromptExecute, tab.id)}
            onInstallPythonModule={_.partial(props.onInstallPythonModule, tab.id)}
            onReRun={_.partial(props.onReRunHistoryBlock, tab.id)}
            visible={tab.id === props.active}
            {...tab.content}
          />
        ),
        'variable-viewer': tab => (
          <VariableViewer
            filter={filter}
            onShowDataFrame={props.onShowDataFrame}
            visible={tab.id === props.active}
            {...tab.content}
          />
        ),
        'variable-table-viewer': tab => (
          <VariableTableViewer filter={filter} visible={tab.id === props.active} {...tab.content}/>
        )
      };
    let popoutButton;

    if (isPopoutAllowed(props)) {
      popoutButton = <ActionestButton icon="expand" onClick={props.onPopActiveTab}/>;
    } else {
      popoutButton = <ActionestButton className="disabled" icon="expand"/>;
    }

    return (
      <TabbedPane
        filter={filter}
        onTabClick={this.handleTabClick}
        onTabClose={this.handleTabClose}
        onTabDragEnd={this.handleTabDragEnd}
        onTabDragStart={this.handleTabDragStart}
        onTabListDragEnter={this.handleTabListDragEnter}
        onTabListDragLeave={this.handleTabListDragLeave}
        onTabListDragOver={this.handleTabListDragOver}
        onTabListDrop={this.handleTabListDrop}
        {...props}
      >
        <li className="right">{popoutButton}</li>
        <li className="right">
          <SearchTextBox onChange={searchFilter => this.setState({searchFilter})}/>
        </li>
        {props.tabs.map(tab => (
          <TabbedPaneItem filter={filter} key={tab.id} {...tab}>
            {_.isFunction(types[tab.contentType]) ? types[tab.contentType](tab) : `Not a known tab type: ${tab.contentType}`}
          </TabbedPaneItem>
        ))}
      </TabbedPane>
    );
  }
}));
