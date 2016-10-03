import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import PostgresqlSettings from './types/postgresql-settings';
import MysqlSettings from './types/mysql-settings';
import RedshiftSettings from './types/redshift-settings';
import SqlserverSettings from './types/sqlserver-settings';
import EmptySuggestion from '../empty/empty-suggestion';
import './manage-connections.css';
import Closeable from '../tabs/closeable';

export default React.createClass({
  displayName: 'ManageConnections',
  propTypes: {
    active: React.PropTypes.string,
    definitions: React.PropTypes.object.isRequired,
    list: React.PropTypes.array, // could be nothing
    onAddConnection: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemoveConnection: React.PropTypes.func.isRequired,
    onSelectConnection: React.PropTypes.func.isRequired,
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleAddConnection: function (event) {
    event.preventDefault();

    this.props.onAddConnection();
  },
  handleRemoveConnection: function (id, event) {
    event.preventDefault();
    event.stopPropagation();

    this.props.onRemoveConnection(id);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      definitions = props.definitions,
      definitionTypes = definitions.types,
      defaultType = _.find(definitionTypes, {name: definitions.defaultType}),
      types = {
        redshift: (item, def) => <RedshiftSettings definition={def} types={definitionTypes} {...item} onChange={props.onChange}/>,
        postgresql: (item, def) => <PostgresqlSettings definition={def} types={definitionTypes} {...item} onChange={props.onChange}/>,
        sqlserver: (item, def) => <SqlserverSettings definition={def} types={definitionTypes} {...item} onChange={props.onChange}/>,
        mysql: (item, def) => <MysqlSettings definition={def} types={definitionTypes} {...item} onChange={props.onChange}/>,
        none: () => <EmptySuggestion label={props.text.selectDatabaseConnectionFromList}/>
      };

    let activeContentFn, activeContentDefinition, activeType,
      activeItem = _.find(props.list, {id: props.active});

    activeType = activeItem && (activeItem.type || definitions.defaultType) || 'none'; // no item selected, so none.
    activeContentFn = types[activeType];
    activeContentDefinition = _.find(definitionTypes, {name: activeType});

    return (
      <div className={className.join(' ')}>
        <div className="connection-list">
          <div className="connection-list-header">
            <span onClick={this.handleAddConnection}>{'Add New Connection'}</span>
          </div>
          {_.map(props.list, item => {
            // unknown type, so plain "sql"
            const definition = _.find(definitionTypes, {name: item.type || defaultType}),
              className = ['connection-list-item'];
            let name, type, closeable;

            if (item === activeItem) {
              className.push('active');
            }

            if (item.name) {
              name = <div className="connection-list-item-name">{item.name}</div>;
            } else {
              name = <div className="connection-list-item-name--empty">{'No name'}</div>;
            }

            if (definition && definition.name) {
              type = <div className="connection-list-item-type">{definition.label}</div>;
            }

            if (item.closeable) {
              closeable = <Closeable onClick={_.partial(this.handleRemoveConnection, item.id)} />;
            }

            return (
              <div className={className.join(' ')} onClick={_.partial(props.onSelectConnection, item.id)}>
                {name}{type}{closeable}
              </div>
            );
          })}
        </div>
        <div className="connection-details">{activeContentFn(activeItem, activeContentDefinition)}</div>
      </div>
    );
  }
});
