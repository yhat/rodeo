import React from 'react';
import commonReact from '../services/common-react';

export default React.createClass({
  displayName: 'ActionButton',
  propTypes: {
    action: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.object])
  },
  contextTypes: {
    store: React.PropTypes.object
  },
  shouldComponentUpdate() {
    // assume correct the first time
    return false;
  },
  handleClick: function () {
    this.context.store.dispatch(this.props.action);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return <button className={className.join(' ')} onClick={this.handleClick}>{props.children}</button>;
  }
});
