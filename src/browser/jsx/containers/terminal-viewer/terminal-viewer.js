import React from 'react';
import HistoryViewer from '../history-viewer/history-viewer';
import PromptViewer from '../prompt-viewer/prompt-viewer';
import commonReact from '../../services/common-react';
import './terminal-viewer.css';

export default React.createClass({
  displayName: 'TerminalViewer',

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className}>
        <HistoryViewer {...props} />
        <PromptViewer {...props} />
      </div>
    );
  }
});
