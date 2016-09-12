import React from 'react';
import TabList from './tab-list.js';
import TabbedPaneItem from './tabbed-pane-item.js';
import TabContentList from './tab-content-list.jsx';
import './tabbed-pane.css';
import _ from 'lodash';
import commonReact from '../../services/common-react';

/**
 * @param {ReactElement} component
 * @param {*} type
 * @returns {boolean}
 */
function isComponentOfType(component, type) {
  // react-hot-module mocks the type, but the displayNames are still okay
  return component.type.displayName === type.displayName;
}

function ensureTabChildrenHaveKeysAndIds(children) {
  return React.Children.map(children, function (child, i) {
    if (isComponentOfType(child, TabbedPaneItem) && !child.key) {
      if (!child.props.id) {
        child = React.cloneElement(child, {id: 'tab-' + i});
      }

      return React.cloneElement(child, {key: 'tab-' + child.props.id.toString()});
    } else {
      return child;
    }
  });
}

/**
 * @param {*} children
 * @returns {Array}
 */
function getTabIds(children) {
  children = ensureTabChildrenHaveKeysAndIds(children);
  children = React.Children.toArray(children);

  return _.filter(_.map(children, 'props.id'), _.identity);
}

// todo: handle focus
//  - grab focus when they click a tab
//  - grab focus when they make a tab

/**
 * @class TabbedPane
 * @extends ReactComponent
 * @property props
 * @property state
 */
export default React.createClass({
  displayName: 'TabbedPane',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    focusable: React.PropTypes.bool.isRequired,
    onTabClick: React.PropTypes.func.isRequired,
    onTabClose: React.PropTypes.func.isRequired, // should close tab if closeable
    onTabDragEnd: React.PropTypes.func.isRequired, // should be able to move and rearrange
    onTabDragStart: React.PropTypes.func.isRequired,
    onTabListDragEnter: React.PropTypes.func.isRequired,
    onTabListDragLeave: React.PropTypes.func.isRequired,
    onTabListDragOver: React.PropTypes.func.isRequired,
    onTabListDrop: React.PropTypes.func.isRequired // when a tab is dropped here (maybe from other tab panes too!)
  },
  getDefaultProps: function () {
    return {
      focusable: true
    };
  },
  shouldComponentUpdate: function (nextProps) {
    console.log('TabbedPane', 'shouldComponentUpdate', !commonReact.shallowEqual(this, nextProps));
    return !commonReact.shallowEqual(this, nextProps);
  },
  render: function () {
    const props = this.props;

    console.log('TabbedPane', 'render');

    return (
      <div className="tabbed-pane">
        <TabList
          active={props.active}
          onDragEnter={props.onTabListDragEnter}
          onDragLeave={props.onTabListDragLeave}
          onDragOver={props.onTabListDragOver}
          onDrop={props.onTabListDrop}
          onTabClick={props.onTabClick}
          onTabClose={props.onTabClose}
          onTabDragEnd={props.onTabDragEnd}
          onTabDragStart={props.onTabDragStart}
        >{props.children}</TabList>
        <TabContentList active={props.active}>{props.children}</TabContentList>
      </div>
    );
  }
});
