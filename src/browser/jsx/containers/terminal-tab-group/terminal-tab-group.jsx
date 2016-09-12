import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import Terminal from '../../components/terminal/terminal.jsx';
import actions from './terminal-tab-group.actions';
import commonReact from '../../services/common-react';

/**
 * @param {function} dispatch
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId;

  return {
    onFocusTab: id => dispatch(actions.focus(groupId, id))
  };
}

/**
 * @class FreeTabGroup
 * @extends ReactComponent
 * @property props
 * @property state
 */
export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'TerminalTabGroup',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool,
    groupId: React.PropTypes.string.isRequired,
    tabs: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    console.log('TerminalTabGroup', 'shouldComponentUpdate', !commonReact.shallowEqual(this, nextProps));
    return !commonReact.shallowEqual(this, nextProps);
  },
  handleNoop: _.noop,
  render: function () {
    console.log('TerminalTabGroup', 'render');

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

    console.log('TerminalTabGroup', 'render2');

    return (
      <TabbedPane
        onTabClick={props.onFocusTab}
        onTabClose={this.handleNoop}
        onTabDragEnd={this.handleNoop}
        onTabDragStart={this.handleNoop}
        onTabListDragEnter={this.handleNoop}
        onTabListDragLeave={this.handleNoop}
        onTabListDragOver={this.handleNoop}
        onTabListDrop={this.handleNoop}
        {...props}
      >{props.tabs.map(function (tab) {
        console.log('TerminalTabGroup', 'render3');

        return (
          <TabbedPaneItem
            closeable={tab.closeable}
            icon={tab.icon}
            id={tab.id}
            key={tab.id}
            label={tab.label}
          >{types[tab.contentType](tab.options)}</TabbedPaneItem>
        );
      })}</TabbedPane>
    );
  }
}));
