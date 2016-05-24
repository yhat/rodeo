import _ from 'lodash';
import React from 'react';

/**
 * @class PythonTestInput
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'PythonTestInput',
  propTypes: {
    cmd: React.PropTypes.string,
    label: React.PropTypes.string,
    onTest: React.PropTypes.func,
    status: React.PropTypes.string
  },
  getDefaultProps: function () {
    return {
      cmd: 'python'
    };
  },
  handleChange: function (e) {
    this.props.onTest(e.target.value);
    e.preventDefault();
  },
  render: function () {
    const props = this.props,
      className = [
        'form',
        'python-test-input'
      ];
    let label;

    if (props.label) {
      label = <label htmlFor="python-test-input">{props.label}</label>;
    }

    if (props.status) {
      className.push(props.status);
    }

    return (
      <form className="form python-test-input">
        <div className="form-group">
          {label}
          <input className={'form-control ' + props.status} id="python-test-input" onChange={this.handleChange} value={props.cmd} />
        </div>
      </form>
    );
  }
});
