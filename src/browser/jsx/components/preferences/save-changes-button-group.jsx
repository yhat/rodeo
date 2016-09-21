import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';

/**
 * @class SaveChangesButtonGroup
 * @extends ReactComponent
 * @property props
 */
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
  getDefaultProps: function () {
    return {
      canSave: true,
      hasChanges: false,
      onCancel: _.noop,
      onOK: _.noop,
      onSave: _.noop,
      type: 'text',
      defaultValue: ''
    };
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props;

    let buttons;

    if (props.hasChanges) {
      buttons = (
        <div>
          <button className="btn btn-default" onClick={props.onCancel}>{'Cancel'}</button>
          <button className="btn btn-default" disabled={!props.canSave} onClick={props.onSave}>{'Save Changes'}</button>
        </div>
      );
    } else {
      buttons = <button className="btn btn-default" onClick={props.onOK}>{'OK'}</button>;
    }

    return buttons;
  }
});
