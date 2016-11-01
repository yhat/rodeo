import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../services/common-react';
import './history.css';

export default React.createClass({
  displayName: 'History',
  propTypes: {
    onClick: React.PropTypes.func
  },
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
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')} onClick={props.onClick}>
        {props.children}
      </div>
    );
  }
});
