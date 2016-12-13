import React from 'react';
import './empty-suggestion.css';
import commonReact from '../../services/common-react';
import Marked from '../marked';

export default React.createClass({
  displayName: 'EmptySuggestion',
  propTypes: {
    label: React.PropTypes.string.isRequired
  },
  getDefaultProps() {
    return {
      label: ''
    };
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    className.push('font-sans');

    return <div className={className.join(' ')}><Marked>{props.label}</Marked></div>;
  }
});
