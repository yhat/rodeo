import React from 'react';
import commonReact from '../../services/common-react';
import './document-terminal-autocomplete.css';

export default React.createClass({
  displayName: 'DocumentTerminalAutocomplete',
  propTypes: {
    text: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return <div className={className.join(' ')}>{props.text}</div>;
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
