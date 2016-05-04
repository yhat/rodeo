import React from 'react';
import TabbedPaneItem from './tabbed-pane-item.jsx';
import './tabbed-pane.less';
import _ from 'lodash';
import cid from '../../services/cid';
import {getParentNodeOf} from '../../services/dom';

const tabClass = 'tabbed-pane-tab',
  activeTabClass = 'active',
  closeTabClass = 'tabbed-pane-close',
  draggableClass = 'tabbed-pane-draggable',
  dropableClass = 'tabbed-pane-droppable';

function isTabDraggable(component) {
  return !!component.props.onTabDragStart;
}

function isChildActive(child, active, index) {
  return (child.props.id === active || (!active && index === 0));
}

function ensureTabChildrenHaveKeysAndIds(children) {
  return React.Children.map(children, function (child, i) {
    if (child.type === TabbedPaneItem && !child.key) {
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

export default React.createClass({
  displayName: 'TabbedPane',
  propTypes: {
    onChange: React.PropTypes.func,
    onChanged: React.PropTypes.func,
    onTabClose: React.PropTypes.func, // should close tab if closeable
    onTabDragEnd: React.PropTypes.func, // should be able to move and rearrange
    onTabDragStart: React.PropTypes.func,
    onTabListDragEnter: React.PropTypes.func,
    onTabListDragLeave: React.PropTypes.func,
    onTabListDragOver: React.PropTypes.func,
    onTabListDrop: React.PropTypes.func // when a tab is dropped here (maybe from other tab panes too!)
  },
  getInitialState: function () {
    return {
      active: ''
    };
  },
  componentWillReceiveProps: function (nextProps) {
    const state = this.state,
      nextChildren = ensureTabChildrenHaveKeysAndIds(nextProps.children),
      nextChildrenIds = getTabIds(nextChildren);
    let selectedChild, activeChild,
      active = state.active;

    selectedChild =  _.find(nextChildren, child => _.get(child, 'props.selected'));
    activeChild = _.find(nextChildren, child => _.get(child, 'props.id') === active);
    if (selectedChild) {
      // if some tab is marked as "selected", it becomes active
      let maybeActive = selectedChild.props.id;

      if (nextChildrenIds.indexOf(maybeActive) !== -1) {
        active = maybeActive;
      }
    } else if (!activeChild && nextChildrenIds.length !== 0) {
      // if no tab is active, then the first tab is active
      active = nextChildrenIds[0];
    }

    if (nextChildrenIds.indexOf(active) !== -1) {
      this.setState({active});
    }
  },
  componentWillUpdate: function (newProps, newState) {
    const state = this.state;

    if (this.props.onChange && state.active !== newState.active) {
      this.props.onChange(state.active, newState.active);
    }
  },
  componentDidUpdate: function (oldProps, oldState) {
    const state = this.state;

    if (this.props.onChanged && oldState.active !== state.active) {
      this.props.onChanged(oldState.active, state.active);
    }
  },
  handleTabListDragEnter: function (event) {
    const target = getParentNodeOf(event.target, 'ul'),
      fn = this.props.onTabListDragEnter;

    if (fn) {
      fn(event, target);
      if (event.isDefaultPrevented()) {
        target.classList.add(dropableClass);
      }
    }
  },
  handleTabListDragLeave: function (event) {
    const target = getParentNodeOf(event.target, 'ul'),
      fn = this.props.onTabListDragLeave;

    if (fn) {
      fn(event, target);
    }

    target.classList.remove(dropableClass);
  },
  handleTabListDragOver: function (event) {
    const fn = this.props.onTabListDragOver;

    if (fn) {
      fn(event);
    }
  },
  handleTabListDrop: function (event) {
    const target = getParentNodeOf(event.target, 'ul'),
      fn = this.props.onTabListDrop;

    if (fn) {
      fn(event, target);
    }

    // never give it to the browser
    event.preventDefault();
  },
  handleTabDragEnd: function (tabId, event) {
    const target = getParentNodeOf(event.target, 'li'),
      fn = this.props.onTabDragEnd;

    if (fn) {
      fn(event, tabId);
    }

    // remove a class
    target.classList.remove(draggableClass);
  },
  handleTabDragStart: function (tabId, event) {
    const target = getParentNodeOf(event.target, 'li'),
      fn = this.props.onTabDragStart;

    if (fn) {
      fn(event, tabId);

      // preventing default in this case means preventing the drag
      if (!event.isDefaultPrevented()) {
        target.classList.add(draggableClass);
      }
    }
  },
  handleTabClick: function (key) {
    this.setActiveKey(key);
  },
  setActiveKey: function (value) {
    const keys = this.getIds();

    if (!value) {
      throw new TypeError('Missing first parameter');
    } else if (keys.indexOf(value) === -1) {
      throw new TypeError('Tab with key ' + value + ' does not exist');
    }

    this.setState({active: value});
  },
  getIds: function () {
    return getTabIds(this.props.children);
  },
  render: function () {
    const active = this.state.active;
    let children, tabList;

    /**
     * @param {React.Component} component
     * @param {React.Component} child
     * @returns {React.Component|undefined}
     */
    function getCloseable(component, child) {
      if (child.props.isCloseable && component.props.onTabClose) {
        let closeableClassName = ['fa', 'fa-times', closeTabClass].join(' ');

        return (
          <span className={closeableClassName} onClick={_.partial(component.props.onTabClose, child.props.id)}/>
        );
      }
    }

    children = ensureTabChildrenHaveKeysAndIds(this.props.children);

    tabList = React.Children.map(children, function (child, i) {
      const cidTab = cid(), // this is specifically for the tabs, not items/children
        className = [
          tabClass,
          isChildActive(child, active, i) ? activeTabClass : ''
        ].join(' '),
        iconClassName = child.props.icon && ['fa', 'fa-before', 'fa-' + child.props.icon].join(' ');

      if (child.type === TabbedPaneItem) {
        return (
          <li className={className} dataTab={child.props.id} key={cidTab}>
            <a
              data-toggle="tab"
              draggable={isTabDraggable(this)}
              onClick={_.partial(this.handleTabClick, child.props.id)}
              onDragEnd={_.partial(this.handleTabDragEnd, child.props.id)}
              onDragStart={_.partial(this.handleTabDragStart, child.props.id)}
            >
              <span className={iconClassName}>{child.props.label}</span>
              {getCloseable(this, child)}
            </a>
          </li>
        );
      } else {
        // must be a list item, even if not a tab
        return <li key={cidTab}>{child}</li>;
      }
    }.bind(this));

    children = React.Children.map(children, function (child, i) {
      if (child.type === TabbedPaneItem) {
        return React.cloneElement(child, {active: isChildActive(child, active, i)});
      }
    });

    return (
      <div className="tabbed-pane">
        <ul className="nav nav-tabs"
          onDragEnter={this.handleTabListDragEnter}
          onDragLeave={this.handleTabListDragLeave}
          onDragOver={this.handleTabListDragOver}
          onDrop={this.handleTabListDrop}
        >{tabList}</ul>
        <div className="tab-content">{children}</div>
      </div>
    );
  }
});