import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import SearchTextBox from '../../components/search-text-box/search-text-box.jsx';
import HistoryViewer from '../history-viewer.jsx';
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

  console.log('FreeTabGroup', 'mapDispatchToProps', dispatch, ownProps);

  return {
    onCloseTab: id => dispatch(freeTabActions.closeTab(groupId, id)),
    onFocusTab: id => dispatch(freeTabActions.focusTab(groupId, id)),
    onMoveTab: id => dispatch(freeTabActions.moveTab(groupId, id))
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
  handleTabClick: function (id) {
    console.log('FreeTabGroup', 'handleTabClick', arguments);
    this.props.onFocusTab(id);
  },
  handleTabClose: function (tabId) {
    const props = this.props,
      tabs = props.tabs,
      targetPane = _.find(tabs, {tabId});

    props.onCloseTab(targetPane.id);
  },
  /**
   * NOTE: preventDefault to reject drag
   * @param {DragEvent} event
   * @param {string} tabId
   */
  handleTabDragStart: function (event, tabId) {
    const el = getParentNodeOf(event.target, 'li'),
      tab = _.find(this.props.tabs, {tabId});

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
    const props = this.props,
      itemStr = event.dataTransfer.getData('application/json');
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
    console.log('FreeTabGroup', 'render');

    const props = this.props,
      state = this.state,
      filter = state.searchFilter,
      types = {
        'history-viewer': content => <HistoryViewer filter={filter} {...content}/>,
        'plot-viewer': content => <PlotViewer {...content}/>,
        'file-viewer': content => <FileViewer filter={filter} {...content}/>,
        'variable-viewer': content => <VariableViewer filter={filter} {...content}/>,
        'variable-table-viewer': content => <VariableTableViewer filter={filter} {...content}/>,
        'package-viewer': content => <PackageViewer filter={filter} {...content}/>,
        'package-search-viewer': content => <PackageSearchViewer filter={filter} {...content}/>
      };

    console.log('FreeTabGroup', 'render2');

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
          console.log('FreeTabGroup', 'render3');

          return (
            <TabbedPaneItem
              closeable={tab.closeable}
              icon={tab.icon}
              id={tab.id}
              key={tab.id}
              label={tab.label}
            >{types[tab.contentType](tab.content)}</TabbedPaneItem>
          );
        })}

      </TabbedPane>
    );
  }
}));
