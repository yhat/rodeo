import _ from 'lodash';
import {connect} from 'react-redux';
import React from 'react';
import commonReact from '../../services/common-react';
import DatabaseExplorerTree from '../../components/databases/database-explorer-tree.jsx';
import actions from './database-viewer.actions.js';

function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId,
    id = ownProps.id;

  return {
    onRefresh: () => dispatch(actions.refreshItems(groupId, id)),
    onExpandItem: indexPath => dispatch(actions.expandItem(groupId, id, indexPath)),
    onContractItem: indexPath => dispatch(actions.contractItem(groupId, id, indexPath)),
    onOpenItem: item => dispatch(actions.openItem(groupId, id, item))
  };
}

export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'DatabaseViewer',
  propTypes: {
    filter: React.PropTypes.string.isRequired,
    groupId: React.PropTypes.string.isRequired,
    id: React.PropTypes.string.isRequired,
    items: React.PropTypes.array.isRequired,
    onContract: React.PropTypes.func.isRequired,
    onExpand: React.PropTypes.func.isRequired,
    onRefresh: React.PropTypes.func.isRequired
  },
  getDefaultProps: function () {
    return {
      filter: ''
    };
  },
  componentDidMount: function () {
    const props = this.props;

    props.onRefresh();
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props;
    let items = props.items;

    if (props.filter) {
      items = _.filter(items, item => item.label.indexOf(props.filter) > -1);
    }

    return (
      <DatabaseExplorerTree
        {...props}
        items={items}
      />
    );
  }
}));
