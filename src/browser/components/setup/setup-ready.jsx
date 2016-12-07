import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupReady',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onFinish: React.PropTypes.func.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <div className="setup-inner">
          <button className="btn btn-default btn-setup-action" onClick={props.onFinish}>{text.readyToRodeo}</button>
        </div>
      </div>
    );
  }
});
