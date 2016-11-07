import React from 'react';
import _ from 'lodash';
import TabbedPaneItem from './tabbed-pane-item.js';
import TabItem from './tab-item';
import commonReact from '../../services/common-react';
import './tab-list.css';

/**
 * @param {ReactChild} component
 * @param {*} type
 * @returns {boolean}
 */
function isComponentOfType(component, type) {
  // react-hot-module mocks the type, but the displayNames are still okay
  return component.type.displayName === type.displayName;
}

export default React.createClass({
  displayName: 'TabList',
  propTypes: {
    active: React.PropTypes.string,
    focusable: React.PropTypes.bool,
    id: React.PropTypes.string,
    onDragEnter: React.PropTypes.func,
    onDragLeave: React.PropTypes.func,
    onDragOver: React.PropTypes.func,
    onDrop: React.PropTypes.func,
    onTabClick: React.PropTypes.func,
    onTabClose: React.PropTypes.func,
    onTabDragEnd: React.PropTypes.func,
    onTabDragStart: React.PropTypes.func
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);


    return (
      <ul
        className={className.join(' ')}
        onDragEnter={props.onDragEnter}
        onDragLeave={props.onDragLeave}
        onDragOver={props.onDragOver}
        onDrop={props.onDrop}
      >
        {React.Children.map(props.children, child => {
          if (isComponentOfType(child, TabbedPaneItem)) {
            const childProps = child.props,
              childId = childProps.id;

            return (
              <TabItem
                active={childId === props.active}
                closeable={childProps.closeable}
                draggable={!!props.onTabDragStart}
                focusable={childProps.focusable !== false}
                icon={childProps.icon}
                key={childId}
                label={childProps.label}
                onClick={_.partial(props.onTabClick, childId)}
                onClose={_.partial(props.onTabClose, childId)}
                onDragEnd={_.partial(props.onTabDragEnd, childId)}
                onDragStart={_.partial(props.onTabDragStart, childId)}
              />
            );
          }

          // non-tab list items are allowed
          return child;
        })}
      </ul>
    );
  }
});
