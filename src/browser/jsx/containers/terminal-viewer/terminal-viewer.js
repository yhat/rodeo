import React from 'react';
import HistoryViewer from '../history-viewer/history-viewer';
import PromptViewer from '../prompt-viewer/prompt-viewer';
import commonReact from '../../services/common-react';
import selectionUtil from '../../services/selection-util';
import './terminal-viewer.css';

export default React.createClass({
  displayName: 'TerminalViewer',

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  handleClick: function (event) {
    event.preventDefault();
    event.stopPropagation();
    const el = event.currentTarget.querySelector('.prompt'),
      isSelectionClick = selectionUtil.isSelectionClick(window.getSelection());

    if (el && isSelectionClick) {
      el.focus();
      window.getSelection().collapse(el, 0);
    }
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className} onClick={this.handleClick}>
        <HistoryViewer {...props} />
        <PromptViewer {...props} />
      </div>
    );
  }
});
