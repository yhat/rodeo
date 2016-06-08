import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabbed-pane/tabbed-pane.jsx';
import TabbedPaneItem from '../../components/tabbed-pane/tabbed-pane-item.jsx';
import SearchTextBox from '../../components/search-text-box/search-text-box.jsx';
import HistoryViewer from '../history-viewer.jsx';
import PlotViewer from '../plot-viewer/plot-viewer.jsx';
import FileViewer from '../file-viewer/file-viewer.jsx';
import VariableViewer from '../variable-viewer.jsx';
import PackageViewer from '../package-viewer.jsx';
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
    onFocusTab: id => dispatch(freeTabActions.focusTab(groupId, id))
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
  render: function () {
    const props = this.props,
      items = props.items,
      types = {
        'history-viewer': () => <HistoryViewer filter={this.state.searchFilter}/>,
        'plot-viewer': () => <PlotViewer />,
        'file-viewer': () => <FileViewer filter={this.state.searchFilter}/>,
        'variable-viewer': () => <VariableViewer filter={this.state.searchFilter}/>,
        'package-viewer': () => <PackageViewer filter={this.state.searchFilter}/>
      };

    return (
      <TabbedPane onChanged={this.handleTabChanged}>
        <li className="right">
          <SearchTextBox onChange={searchFilter => this.setState({searchFilter})}/>
        </li>

        {items.map(item => {
          return (
            <TabbedPaneItem icon={item.icon} id={item.tabId} key={item.tabId} label={item.label}>
              {types[item.contentType]()}
            </TabbedPaneItem>
          );
        })}

      </TabbedPane>
    );
  }
}));
