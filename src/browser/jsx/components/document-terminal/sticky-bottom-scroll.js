import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../services/common-react';
import './sticky-bottom-scroll.css';

/**
 * If already scrolled to the bottom, when new content it added, it remains scrolled to the bottom
 */
export default React.createClass({
  displayName: 'StickyBottomScroll',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  componentWillUpdate: function () {
    const el = ReactDOM.findDOMNode(this);

    this.shouldScrollBottom = el.scrollTop + el.offsetHeight === el.scrollHeight;
  },
  componentDidUpdate: function () {
    if (this.shouldScrollBottom) {
      const el = ReactDOM.findDOMNode(this);

      el.scrollTop = el.scrollHeight;
    }
  },
  handleScroll: function () {
    const el = ReactDOM.findDOMNode(this);

    this.shouldScrollBottom = el.scrollTop + el.offsetHeight === el.scrollHeight;
  },
  /**
   * If we were at the bottom after the last update or scroll, maintain it
   */
  update: function () {
    if (this.shouldScrollBottom) {
      const el = ReactDOM.findDOMNode(this);

      el.scrollTop = el.scrollHeight;
    }
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return <div className={className.join(' ')} onScroll={this.handleScroll}>{props.children}</div>;
  }
});
