import React from 'react';
import commonReact from '../../services/common-react';
import BlockHistory from '../../components/block-history/block-history';

export default React.createClass({
  displayName: 'HistoryViewer',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    return <BlockHistory {...this.props} />;
  }
});
