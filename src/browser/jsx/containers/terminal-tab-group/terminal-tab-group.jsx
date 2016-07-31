import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import Terminal from '../../components/terminal/terminal.jsx';
import actions from './terminal-tab-group.actions';

/**
 * @param {object} state  New state after an action occurred
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapStateToProps(state, ownProps) {
  return _.find(state.terminalTabGroups, {groupId: ownProps.id});
}

/**
 * @param {function} dispatch
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.id;

  return {
    onFocusTab: id => actions.focus(groupId, id)
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
  shouldComponentUpdate: function (nextProps) {
    const props = this.props;

    // if the references changed, then some item has changed and needs a re-render
    return (props.active !== nextProps.active) ||
      (props.disabled !== props.disabled) ||
      (props.items !== nextProps.items);
  },
  handleNoop: _.noop,
  render: function () {
    const props = this.props,
      types = {
        terminal: options => (
          <Terminal
            disabled={props.disabled}
            onAutoComplete={props.onTerminalAutoComplete}
            onInterrupt={props.onInterrupt}
            onStart={props.onTerminalStart}
            {...options}
          />
        )
      };

    return (
      <TabbedPane
        active={props.active}
        onTabClick={props.onFocusTab}
        onTabClose={this.handleNoop}
        onTabDragEnd={this.handleNoop}
        onTabDragStart={this.handleNoop}
        onTabListDragEnter={this.handleNoop}
        onTabListDragLeave={this.handleNoop}
        onTabListDragOver={this.handleNoop}
        onTabListDrop={this.handleNoop}
      >{props.items.map(function (item) {
        return (
          <TabbedPaneItem
            closeable={item.closeable}
            icon={item.icon}
            id={item.id}
            key={item.id}
            label={item.label}
          >{types[item.contentType](item.options)}</TabbedPaneItem>
        );
      })}</TabbedPane>
    );
  }
}));
