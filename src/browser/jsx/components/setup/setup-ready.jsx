import _ from 'lodash';
import React from 'react';

export default React.createClass({
  displayName: 'SetupReady',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onFinish: React.PropTypes.func.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      text = props.text,
      className = [_.kebabCase(displayName)];

    if (props.className) {
      className.push(props.className);
    }

    return (
      <div className={className.join(' ')}>
        <button className="btn btn-default btn-setup-action" onClick={props.onFinish}>{text.readyToRodeo}</button>
      </div>
    );
  }
});
