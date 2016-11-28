import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './tab-button.css';

export default React.createClass({
  displayName: 'TabButton',
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func, // not required when disabled
    title: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.string])
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      iconClassName = ['fa', 'fa-' + props.icon];
    let title;

    if (props.title) {
      if (_.isObject(props.title) && props.title !== null) {
        title = props.title[process.platform] || props.title.default;
      } else if (_.isString(props.title)) {
        title = props.title;
      }
    }

    return (
      <li className={className.join(' ')}>
        <button onClick={props.onClick} title={title}>
          <span className={iconClassName.join(' ')} />
          <span className="icon-text-right font-sans">{props.label}</span>
        </button>
      </li>
    );
  }
});
