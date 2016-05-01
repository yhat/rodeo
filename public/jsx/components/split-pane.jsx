import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

export default React.createClass({
  displayName: 'SplitPane',
  propTypes: {
    direction: React.PropTypes.oneOf(['top-bottom', 'left-right']).isRequired // not horizontal/vertical; often interpreted wrong
  },
  componentDidMount: function () {
    $(ReactDOM.findDOMNode(this)).split({
      orientation: this.props.direction === 'top-bottom' ? 'horizontal' : 'vertical',
      limit: 100,
      position: '50%'
    }).refresh();
  },
  render: function () {
    return (
      <div>{this.props.children}</div>
    );
  }
});