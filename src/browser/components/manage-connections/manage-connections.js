import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import EmptySuggestion from '../empty/empty-suggestion';
import './manage-connections.css';
import ConnectionButton from './connection-button';
import ConnectionErrors from './connection-errors';
import ConnectionConfig from './connection-config';
import ConnectionList from './connection-list';

export default React.createClass({
  displayName: 'ManageConnections',
  propTypes: {
    active: React.PropTypes.string,
    list: React.PropTypes.array // could be nothing
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this),
      connectionDetailsContent = [],
      item = _.find(props.list, {id: props.active});

    if (item) {
      connectionDetailsContent.push(<ConnectionButton key="connection-button" {...props} {...item} />);

      if (props.errors && props.errors.length) {
        connectionDetailsContent.push(<ConnectionErrors errors={props.errors} key="connection-errors"/>);
      }

      connectionDetailsContent.push(<hr key="hr"/>);
      connectionDetailsContent.push(<ConnectionConfig key="connection-config" {...props} {...item}/>);
    } else {
      connectionDetailsContent.push(<EmptySuggestion key="empty-suggestion" label={text.selectDatabaseConnectionFromList}/>);
    }

    return (
      <div className={className.join(' ')}>
        <ConnectionList {...props} />
        <div className="connection-details">
          {connectionDetailsContent}
        </div>
      </div>
    );
  }
});
