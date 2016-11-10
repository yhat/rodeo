import React from 'react';
import HistoryViewer from '../history-viewer/history-viewer';
import PromptViewer from '../prompt-viewer/prompt-viewer';
import commonReact from '../../services/common-react';
import selectionUtil from '../../services/selection-util';
import './block-terminal-viewer.css';

/**
 * @param {Event} event
 * @returns {boolean}
 */
function isHighestFocusableTarget(event) {
  const currentTarget = event.currentTarget;
  let cursor = event.target;

  while (cursor && cursor.getAttribute) {
    const tabIndex = cursor.getAttribute('tabIndex');

    if (currentTarget === cursor) {
      return true;
    } else if (tabIndex !== null && parseInt(tabIndex, 10) >= 0) {
      return false;
    }

    cursor = cursor.parentNode;
  }

  return false;
}

export default React.createClass({
  displayName: 'BlockTerminalViewer',

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  handleClick: function (event) {
    const el = event.currentTarget.querySelector('.prompt'),
      isSelectionClick = selectionUtil.isSelectionClick(window.getSelection());

    if (el && isSelectionClick && isHighestFocusableTarget(event)) {
      event.preventDefault();
      event.stopPropagation();
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
