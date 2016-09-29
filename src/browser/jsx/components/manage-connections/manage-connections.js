import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import PostgresqlSettings from './types/postgresql-settings';
import './manage-connections.css';

export default React.createClass({
  displayName: 'ManageConnections',
  propTypes: {
    active: React.PropTypes.string,
    databaseDefinitions: React.PropTypes.array.isRequired,
    list: React.PropTypes.array, // could be nothing
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      databaseDefinitions = props.databaseDefinitions,
      types = {
        redshift: (item, def) => <div>{'redshift'}</div>,
        postgresql: (item, def) => <PostgresqlSettings definition={def} types={databaseDefinitions} {...item}/>,
        sqlserver: (item, def) => <div>{'sqlserver'}</div>,
        mysql: (item, def) => <div>{'mysql'}</div>,
        sql: (item, def) => <div>{'sql'}</div>,
        none: (item, def) => <div>{'none'}</div>
      },
      activeItem = _.find(props.list, {id: props.active}),
      activeType = activeItem && activeItem.type || 'none', // no item selected, so none.
      contentFn = types[activeType],
      contentDefinition = databaseDefinitions[activeType];

    return (
      <div className={className.join(' ')}>
        <div className="connection-list">
          {_.map(props.list, item => {
            // unknown type, so plain "sql"
            const definition = databaseDefinitions[item.type] || databaseDefinitions['sql'];

            return (
              <div onClick={_.partial(props.onSelectConnection, item, definition)}>
                <div>{item.name}</div>
                <div>{definition.name}</div>
              </div>
            );
          })}
          <div onClick={props.onSelectNewConnection}>
            <div>{'Add New Connection'}</div>
          </div>
        </div>
        <div className="connection-details">{contentFn(activeItem, contentDefinition)}</div>
      </div>
    );
  }
});
