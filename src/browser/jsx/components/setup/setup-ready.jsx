import React from 'react';

/**
 * @class SetupReady
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'SetupReady',
  propTypes: {
    onReady: React.PropTypes.func.isRequired
  },
  render: function () {
    return (
      <div className="setup-ready container">
        <div className="row">
          <h2>{'Ready to Rodeo!'}</h2>
          <p className="lead">
            <a onClick={this.props.onReady}>{'Yeehah!'}</a>
          </p>
        </div>
      </div>
    );
  }
});
