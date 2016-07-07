import React from 'react';

/**
 * @class SetupLoadingIcon
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'SetupLoadingIcon',
  propTypes: {
    isLoading: React.PropTypes.bool.isRequired,
    label: React.PropTypes.string.isRequired
  },
  getInitialState: function () {
    return {};
  },
  componentDidMount: function () {
    this.setState({
      hasRenderedBefore: true
    });
  },
  render: function () {
    const props = this.props,
      state = this.state,
      style = {
        opacity: props.isLoading && state.hasRenderedBefore ? 1 : 0
      };

    return (
      <div className="setup-loading-icon" style={style}>
        <span className="fa fa-4x fa-cog fa-spin" />
        <div>{props.label}</div>
      </div>
    );
  }
});
