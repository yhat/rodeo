import React from 'react';
import TabbedPaneItem from './tabbed-pane-item.js';
import SwipeTransitionGroup from './swipe-transition-group';

/**
 * @param {*} component
 * @param {*} type
 * @returns {boolean}
 */
function isComponentOfType(component, type) {
  // react-hot-module mocks the type, but the displayNames are still okay
  return component.type.displayName === type.displayName;
}

function isChildActive(child, active, index) {
  return (child.props.id === active || (!active && index === 0));
}

export default React.createClass({
  displayName: 'TabContentList',
  propTypes: {
    active: React.PropTypes.string
  },
  render: function () {
    const props = this.props;

    return (
      <SwipeTransitionGroup active={props.active}>
        {React.Children.map(props.children, function (child, i) {
          if (isComponentOfType(child, TabbedPaneItem)) {
            return React.cloneElement(child, {active: isChildActive(child, props.active, i)});
          }
        })}
      </SwipeTransitionGroup>
    );
  }
});
