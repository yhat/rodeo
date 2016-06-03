import React from 'react';
import ReactDOM from 'react-dom';

/**
 * @class UnsafeHTML
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'UnsafeHTML',
  propTypes: {
    id: React.PropTypes.string.isRequired,
    src: React.PropTypes.string.isRequired
  },
  componentDidMount: function () {
    const el = ReactDOM.findDOMNode(this);

    if (el) {
      el.setAttribute('src', this.props.src);
    }
  },
  render: function () {
    return <iframe frameBorder="0" id={this.props.id} sandbox="allow-scripts"></iframe>;
  }
});
