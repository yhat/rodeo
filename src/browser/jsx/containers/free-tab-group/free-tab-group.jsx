import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import SearchTextBox from '../../components/search-text-box/search-text-box.jsx';
import HistoryViewer from '../../components/history-viewer/history-viewer.jsx';
import PlotViewer from '../plot-viewer/plot-viewer.jsx';
import FileViewer from '../file-viewer/file-viewer.jsx';
import VariableViewer from '../../components/variable-viewer/variable-viewer.jsx';
import VariableTableViewer from '../variable-table-viewer.jsx';
import PackageViewer from '../package-viewer/package-viewer.jsx';
import PackageSearchViewer from '../package-search-viewer/package-search-viewer.jsx';
import { getParentNodeOf } from '../../services/dom';
import freeTabActions from './free-tab-group.actions';
import commonReact from '../../services/common-react';

/**
 * @param {function} dispatch
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId;

  return {
    onCloseTab: id => dispatch(freeTabActions.closeTab(groupId, id)),
    onFocusTab: id => dispatch(freeTabActions.focusTab(groupId, id)),
    onMoveTab: id => dispatch(freeTabActions.moveTab(groupId, id)),
    onShowDataFrame: item => dispatch(freeTabActions.showDataFrame(groupId, item))
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
    console.log('FreeTabGroup', 'getInitialState');
    return {searchFilter: ''};
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    console.log('FreeTabGroup', 'shouldComponentUpdate', !commonReact.shallowEqual(this, nextProps, nextState));
    return !commonReact.shallowEqual(this, nextProps, nextState);
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
   * @param {DragEvent} event
   * @param {string} tabId
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
        'history-viewer': tab => <HistoryViewer filter={filter} {...tab.content}/>,
        'plot-viewer': tab => <PlotViewer {...tab.content}/>,
        'file-viewer': tab => <FileViewer filter={filter} {...tab.content}/>,
        'variable-viewer': tab => (
          <VariableViewer filter={filter} onShowDataFrame={props.onShowDataFrame} visible={tab.id === props.active} {...tab.content}/>
        ),
        'variable-table-viewer': tab => (
          <VariableTableViewer filter={filter} visible={tab.id === props.active} {...tab.content}/>
        ),
        'package-viewer': tab => <PackageViewer filter={filter} {...tab.content}/>,
        'package-search-viewer': tab => <PackageSearchViewer filter={filter} {...tab.content}/>
      };

    console.log('FreeTabGroup', 'render', props);

    return (
      <TabbedPane
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
        <li className="right">
          <SearchTextBox onChange={searchFilter => this.setState({searchFilter})}/>
        </li>

        {props.tabs.map(tab => {
          console.log('FreeTabGroup', 'render3', tab);

          return <TabbedPaneItem key={tab.id}{...tab}>{types[tab.contentType](tab)}</TabbedPaneItem>;
        })}

      </TabbedPane>
    );
  }
}));
