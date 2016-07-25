import _ from 'lodash';
import React from 'react';

/**
 * @class DataFrameLoadingIcon
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'DataFrameLoadingIcon',
  propTypes: {
    isLoading: React.PropTypes.bool.isRequired,
    label: React.PropTypes.string.isRequired
  },
  getInitialState: function () {
    return {};
  },
  componentDidMount: function () {
    _.defer(() => this.setState({
      hasRendered: true
    }));
  },
  hasRendered: function () {
    this.setState({
      hasRendered: true
    });
  },
  render: function () {
    const props = this.props,
      state = this.state,
      style = {
        opacity: props.isLoading && state.hasRendered ? 1 : 0
      };

    return (
      <div className="data-frame-loading-icon" style={style}>
        <span className="fa fa-4x fa-cog fa-spin" />
        <div>{props.label}</div>
      </div>
    );
  }
});
