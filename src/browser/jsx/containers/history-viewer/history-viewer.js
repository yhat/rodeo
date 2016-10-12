import {connect} from 'react-redux';
import React from 'react';
import commonReact from '../../services/common-react';
import EnhancedHistory from '../../components/history-viewer/enhanced-history';
import actions from './history-viewer.actions';

function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId,
    id = ownProps.id;

  return {
    onHistoryViewerExecutionBlockRemoved: blockId => dispatch(actions.removeExecutionBlock(groupId, id, blockId))
  };
}

export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'HistoryViewer2',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    return <EnhancedHistory {...this.props} />;
  }
}));
