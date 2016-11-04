import React from 'react';
import commonReact from '../../services/common-react';
import textUtil from '../../services/text-util';
import './document-terminal-autocomplete.css';

export default React.createClass({
  displayName: 'DocumentTerminalAutocomplete',
  propTypes: {
    matches: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      matches = props.matches,
      className = commonReact.getClassNameList(this),
      longestLen = textUtil.longestLength(matches),
      paddedMatches = matches.map(match => textUtil.padRight(match, longestLen));

    return (
      <div className={className.join(' ')}>
        {paddedMatches.map(match => <span className="document-terminal-autocomplete-item">{match}</span>)}
      </div>
    );
  }
});
