import React from 'react';
import commonReact from '../../services/common-react';
import './tab-overflow-image.css';

export default React.createClass({
  displayName: 'TabOverflowImage',
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    src: React.PropTypes.string.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      style = {
        backgroundImage: 'url(' + props.src + ')'
      };


    return (
      <li className={className.join(' ')}><a onClick={props.onClick} style={style}>{' '}</a></li>
    );
  }
});
