import React from 'react';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SaveChangesButtonGroup',
  propTypes: {
    canSave: React.PropTypes.bool,
    hasChanges: React.PropTypes.bool,
    id: React.PropTypes.string,
    onCancel: React.PropTypes.func,
    onOK: React.PropTypes.func,
    onSave: React.PropTypes.func
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  getDefaultProps: function () {
    return {
      canSave: true,
      hasChanges: false,
      type: 'text',
      defaultValue: ''
    };
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text;

    let buttons;

    if (props.hasChanges) {
      buttons = (
        <div>
          <button className="btn btn-default" onClick={props.onCancel}>{text.cancel}</button>
          <button className="btn btn-default" disabled={!props.canSave} onClick={props.onSave}>{text.saveChanges}</button>
        </div>
      );
    } else {
      buttons = <button className="btn btn-default" onClick={props.onOK}>{text.ok}</button>;
    }

    return buttons;
  }
});
