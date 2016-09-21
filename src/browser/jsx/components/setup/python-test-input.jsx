import React from 'react';
import commonReact from '../../services/common-react';

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
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleChange: function (e) {
    this.props.onTest(e.target.value);
    e.preventDefault();
  },
  handleSubmit: function (e) {
    e.preventDefault();
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this).concat(['form']);
    let label;

    if (props.label) {
      label = <label htmlFor="python-test-input">{props.label}</label>;
    }

    if (props.status) {
      className.push(props.status);
    }

    return (
      <form className="form python-test-input" onSubmit={this.handleSubmit}>
        <div className="form-group">
          {label}
          <input className={'form-control ' + props.status} id="python-test-input" onChange={this.handleChange} value={props.cmd} />
        </div>
      </form>
    );
  }
});
