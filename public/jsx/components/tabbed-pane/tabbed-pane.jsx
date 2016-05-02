import React from 'react';
import TabbedPaneItem from './tabbed-pane-item.jsx';
import './tabbed-pane.less';
import _ from 'lodash';

export default React.createClass({
  displayName: 'TabbedPane',
  propTypes: {
    onTabClose: React.PropTypes.func
  },
  getInitialState: function () {
    return {
      activeIndex: 0
    };
  },
  handleSelectTab: function (i) {
    this.setState({
      activeIndex: i
    });
  },
  render: function () {
    const activeIndex = this.state.activeIndex;
    let children, tabList;

    tabList = React.Children.map(this.props.children, function (child, i) {
      const activeClassPath = i === activeIndex ? 'active' : '',
        className = child.props.icon && 'fa fa-before fa-' + child.props.icon;
      
      if (child.type === TabbedPaneItem) {
        let closeable;

        if (child.props.isCloseable && this.props.onTabClose) {
          closeable = <span className="fa fa-times tabbed-pane-close" onClick={_.partial(this.props.onTabClose, i)}/>;
        }

        return (
          <li className={activeClassPath} key={i}>
            <a data-toggle="tab" onClick={this.handleSelectTab.bind(this, i)}>
              <span className={className}>{child.props.label}</span>
              {closeable}
            </a>
          </li>
        );
      } else {
        console.log('is not TabbedPaneItem', child, i);
        // must be a list item
        return <li>{child}</li>;
      }

    }.bind(this));

    children = React.Children.map(this.props.children, function (child, i) {
      if (child.type === TabbedPaneItem) {
        return React.cloneElement(child, { active: i === activeIndex });
      }
    });

    return (
      <div className="tabbed-pane">
        <ul className="nav nav-tabs">{tabList}</ul>
        <div className="tab-content">{children}</div>
      </div>
    );
  }
});