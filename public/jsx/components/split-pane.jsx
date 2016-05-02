import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

export default React.createClass({
  displayName: 'SplitPane',
  propTypes: {
    // not horizontal/vertical; often interpreted wrong,
    direction: React.PropTypes.oneOf(['top-bottom', 'left-right']).isRequired,
    onDrag: React.PropTypes.func,
    onDragEnd: React.PropTypes.func,
    onDragStart: React.PropTypes.func
  },
  componentDidMount: function () {
    $(ReactDOM.findDOMNode(this)).split({
      orientation: this.props.direction === 'top-bottom' ? 'horizontal' : 'vertical',
      limit: 100,
      position: '50%',
      onDragStart: this.props.onDragStart || $.noop,
      onDragEnd: this.props.onDragEnd || $.noop,
      onDrag: this.props.onDrag || $.noop
    }).refresh();
  },
  render: function () {
    return (
      <div>{this.props.children}</div>
    );
  }
});