import React from 'react';

/**
 * @class ActionButton
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'DocCode',
  propTypes: {
    action: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.object]),
    className: React.PropTypes.string
  },
  contextTypes: {
    store: React.PropTypes.object
  },
  handleClick: function () {
    this.context.store.dispatch(this.props.action);
  },
  render: function () {
    return (
      <button className={this.props.className} onClick={this.handleClick}>{this.props.children}</button>
    );
  }
});
