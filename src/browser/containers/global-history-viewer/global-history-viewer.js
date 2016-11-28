import React from 'react';
import HistoryViewer from '../history-viewer/history-viewer';
import commonReact from '../../services/common-react';
import StickyBottomScroll from '../../components/document-terminal/sticky-bottom-scroll';
import './global-history-viewer.css';

export default React.createClass({
  displayName: 'GlobalHistoryViewer',

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <StickyBottomScroll className={className}>
        <HistoryViewer {...props} />
      </StickyBottomScroll>
    );
  }
});
