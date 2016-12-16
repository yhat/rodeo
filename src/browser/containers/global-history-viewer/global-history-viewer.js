import React from 'react';
import {connect} from 'react-redux';
import HistoryViewer from '../history-viewer/history-viewer';
import commonReact from '../../services/common-react';
import StickyBottomScroll from '../../components/document-terminal/sticky-bottom-scroll';
import './global-history-viewer.css';
import actions from '../history-viewer/history-viewer.actions';

/**
 * @param {function} dispatch
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId,
    id = ownProps.tabId;

  return {
    onBlockRemove: blockId => dispatch(actions.createBlockRemove(groupId, id, blockId)),
    onContract: (blockId, itemId) => dispatch(actions.createContract(groupId, id, blockId, itemId)),
    onExpand: (blockId, itemId) => dispatch(actions.createExpand(groupId, id, blockId, itemId))
  };
}

export default connect(null, mapDispatchToProps)(React.createClass({
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
}));
