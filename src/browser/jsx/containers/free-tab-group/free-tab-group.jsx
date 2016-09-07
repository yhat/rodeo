import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabbed-pane/tabbed-pane.jsx';
import TabbedPaneItem from '../../components/tabbed-pane/tabbed-pane-item.jsx';
import SearchTextBox from '../../components/search-text-box/search-text-box.jsx';
import HistoryViewer from '../history-viewer.jsx';
import PlotViewer from '../plot-viewer/plot-viewer.jsx';
import FileViewer from '../file-viewer/file-viewer.jsx';
import VariableViewer from '../variable-viewer/variable-viewer.jsx';
import VariableTableViewer from '../variable-table-viewer.jsx';
import PackageViewer from '../package-viewer/package-viewer.jsx';
import PackageSearchViewer from '../package-search-viewer/package-search-viewer.jsx';
import { getParentNodeOf } from '../../services/dom';
import freeTabActions from './free-tab-group.actions';

/**
 * @param {object} state  New state after an action occurred
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapStateToProps(state, ownProps) {
  return _.find(state.freeTabGroups, {groupId: ownProps.id});
}

/**
 * @param {function} dispatch
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.id;

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
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'FreeTabGroup',
  propTypes: {
    disabled: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    items: React.PropTypes.array.isRequired
  },
  getInitialState: function () {
    return {searchFilter: ''};
  },
  handleTabChanged: function (oldTabId, tabId) {
    // todo: remove 'refs', we can find it by id instead
    // find the active ace-pane, and focus on it
    const props = this.props,
      items = props.items,
      newPane = _.find(items, {tabId});

    props.onFocusTab(newPane.id);
  },
  handleTabClose: function (tabId) {
    const props = this.props,
      items = props.items,
      targetPane = _.find(items, {tabId});

    props.onCloseTab(targetPane.id);
  },
  /**
   * NOTE: preventDefault to reject drag
   * @param {DragEvent} event
   * @param {string} tabId
   */
  handleTabDragStart: function (event, tabId) {
    const el = getParentNodeOf(event.target, 'li'),
      item = _.find(this.props.items, {tabId});

    if (item) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', el.outerHTML);
      event.dataTransfer.setData('application/json', JSON.stringify(item));
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
        console.log(ex);
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
      items = props.items,
      types = {
        'history-viewer': options => <HistoryViewer filter={this.state.searchFilter} options={options}/>,
        'plot-viewer': options => <PlotViewer options={options}/>,
        'file-viewer': options => <FileViewer filter={this.state.searchFilter} options={options}/>,
        'variable-viewer': options => <VariableViewer filter={this.state.searchFilter} options={options}/>,
        'variable-table-viewer': options => <VariableTableViewer filter={this.state.searchFilter} options={options}/>,
        'package-viewer': options => <PackageViewer filter={this.state.searchFilter} options={options}/>,
        'package-search-viewer': options => <PackageSearchViewer filter={this.state.searchFilter} options={options}/>
      };

    return (
      <TabbedPane
        onChanged={this.handleTabChanged}
        onTabClose={this.handleTabClose}
        onTabDragEnd={this.handleTabDragEnd}
        onTabDragStart={this.handleTabDragStart}
        onTabListDragEnter={this.handleTabListDragEnter}
        onTabListDragOver={this.handleTabListDragOver}
        onTabListDrop={this.handleTabListDrop}
      >
        <li className="right">
          <SearchTextBox onChange={searchFilter => this.setState({searchFilter})}/>
        </li>

        {items.map(item => {
          return (
            <TabbedPaneItem
              hasFocus={item.hasFocus}
              icon={item.icon}
              id={item.tabId}
              isCloseable={item.isCloseable}
              key={item.id}
              label={item.label}
            >
              {types[item.contentType](item.options)}
            </TabbedPaneItem>
          );
        })}

      </TabbedPane>
    );
  }
}));
