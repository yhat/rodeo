import React from 'react';
import commonReact from '../../services/common-react';
import './tab-add.css';

export default React.createClass({
  displayName: 'TabAdd',
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate() {
    return false;
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    console.log('TabAdd', 'render');

    return <li className={className.join(' ')}>
      <a onClick={props.onClick}><span className="fa fa-plus-square-o" /></a>
    </li>;
  }
});
