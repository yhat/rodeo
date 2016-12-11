import React from 'react';
import commonReact from '../../../services/common-react';

export default React.createClass({
  displayName: 'EnvironmentVariablesDialog',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render() {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <div>{'PATH'}</div>
        <div>{text.environmentVariables}</div>
        <div>
          <button onClick={props.onOK}>{text.ok}</button>
        </div>
      </div>
    );
  }
});
