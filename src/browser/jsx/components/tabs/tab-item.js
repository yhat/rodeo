import React from 'react';
import Closeable from './closeable';
import commonReact from '../../services/common-react';
import './tab-item.css';
const activeTabClass = 'active';

export default React.createClass({
  displayName: 'TabItem',
  propTypes: {
    active: React.PropTypes.bool,
    closeable: React.PropTypes.bool,
    draggable: React.PropTypes.bool,
    focusable: React.PropTypes.bool,
    icon: React.PropTypes.string.isRequired,
    id: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired,
    onDragEnd: React.PropTypes.func.isRequired,
    onDragStart: React.PropTypes.func.isRequired
  },
  getDefaultProps: function () {
    return {
      active: false,
      closeable: false,
      draggable: false,
      focusable: true
    };
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    let closeable;
    const props = this.props,
      className = commonReact.getClassNameList(this),
      iconClassName = ['fa', 'fa-before', 'fa-' + props.icon];


    if (props.closeable && props.onClose) {
      closeable = <Closeable onClick={props.onClose} />;
    }

    if (props.active) {
      className.push(activeTabClass);
    }

    return (
      <li
        className={className.join(' ')}
        draggable={props.draggable}
        onClick={props.onClick}
        onDragEnd={props.onDragEnd}
        onDragStart={props.onDragStart}
        tabIndex={props.focusable ? 0 : null}
      >
        <div className="tab-label">
          <span className={iconClassName.join(' ')} />
          <span className="font-sans">{props.label}</span>
          {closeable}
        </div>
        <div className="lift"></div>
      </li>
    );
  }
});
