import React from 'react';
import commonReact from '../../services/common-react';
import './tab-button.css';

export default React.createClass({
  displayName: 'TabButton',
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      iconClassName = ['fa', 'fa-' + props.icon];


    return (
      <li className={className.join(' ')}>
        <button onClick={props.onClick} title={props.title}>
          <span className={iconClassName.join(' ')} />
          <span className="icon-text-right font-sans">{props.label}</span>
        </button>
      </li>
    );
  }
});
