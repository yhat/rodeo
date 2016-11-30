import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'ConnectionButton',
  propTypes: {
    definitions: React.PropTypes.object.isRequired,
    list: React.PropTypes.array, // could be nothing
    onConnect: React.PropTypes.func.isRequired,
    onDisconnect: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleAddConnection: function (event) {
    event.preventDefault();

    this.props.onAddConnection();
  },
  handleRemoveConnection: function (id, event) {
    event.preventDefault();
    event.stopPropagation();

    this.props.onRemoveConnection(id);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      activeItem = _.find(props.list, {id: props.active}),
      connected = !!activeItem && activeItem.id === props.connected;
    let connectButton;

    className.push('layout-buttons--align-right');

    if (connected) {
      connectButton = <button className="btn btn-default" onClick={_.partial(props.onDisconnect, props.id)}>{'Disconnect'}</button>;
    } else {
      connectButton = <button className="btn btn-success" onClick={_.partial(props.onConnect, props.id)}>{'Connect'}</button>;
    }

    return <div className={className.join(' ')}>{connectButton}</div>;
  }
});
