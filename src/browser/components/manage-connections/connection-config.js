import React from 'react';
import commonReact from '../../services/common-react';
import PostgresqlSettings from './types/postgresql-settings';
// import MysqlSettings from './types/mysql-settings';
// import RedshiftSettings from './types/redshift-settings';
// import SqlserverSettings from './types/sqlserver-settings';

export default React.createClass({
  displayName: 'ConnectionConfig',
  propTypes: {
    definitions: React.PropTypes.object.isRequired,
    list: React.PropTypes.array, // could be nothing
    onChange: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      types = {
        postgresql: () => <PostgresqlSettings {...props} />
      },
      type = props.type || props.definitions.defaultType; // no item selected, so none.

    return <div className={className.join(' ')}>{types[type]()}</div>;
  }
});
