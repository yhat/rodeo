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
    active: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    tabs: React.PropTypes.array.isRequired
  },
  getInitialState: function () {
    return {searchFilter: ''};
  },
  shouldComponentUpdate: function (nextProps) {
    const props = this.props;

    // if the references changed, then some item has changed and needs a re-render
    return (props.active !== nextProps.active) ||
      (props.disabled !== props.disabled) ||
      (props.items !== nextProps.items);
  },
  handleTabClick: function (id) {
    console.log('freeTabGroup', 'handleTabClick', arguments);
    this.props.onFocusTab(id);
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
      types = {
        'history-viewer': options => <HistoryViewer filter={this.state.searchFilter} options={options}/>,
        'plot-viewer': options => <PlotViewer options={options}/>,
        'file-viewer': options => <FileViewer filter={this.state.searchFilter} options={options}/>,
        'variable-viewer': options => <VariableViewer filter={this.state.searchFilter} options={options}/>,
        'variable-table-viewer': options => <VariableTableViewer filter={this.state.searchFilter} options={options}/>,
        'package-viewer': options => <PackageViewer filter={this.state.searchFilter} options={options}/>
      };

    return (
      <TabbedPane
        active={props.active}
        onTabClick={this.handleTabClick}
        onTabClose={this.handleTabClose}
        onTabDragEnd={this.handleTabDragEnd}
        onTabDragStart={this.handleTabDragStart}
        onTabListDragEnter={this.handleTabListDragEnter}
        onTabListDragLeave={this.handleTabListDragLeave}
        onTabListDragOver={this.handleTabListDragOver}
        onTabListDrop={this.handleTabListDrop}
      >
        <li className="right">
          <SearchTextBox onChange={searchFilter => this.setState({searchFilter})}/>
        </li>

        {props.items.map(item => {
          return (
            <TabbedPaneItem
              closeable={item.closeable}
              icon={item.icon}
              id={item.id}
              key={item.id}
              label={item.label}
            >{types[item.contentType](item.options)}</TabbedPaneItem>
          );
        })}

      </TabbedPane>
    );
  }
}));
