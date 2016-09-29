import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';
import './manage-connections.css';

export default React.createClass({
  displayName: 'PostgresqlSettings',
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    text: React.PropTypes.object.isRequired,
    types: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleNoop: function (event) {
    event.preventDefault();
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        {'POSTGRESQL'}
        <form onSubmit={this.handleNoop}>
          <input name="name" onChange={_.partial(props.onChange, 'name')} value={props.name}/>
          <select name="type" onChange={_.partial(props.onChange, 'type')} value={props.type}>
            {_.map(props.types, type => <option value={type.name}>{type.label}</option>)}
          </select>
          <input name="host" onChange={_.partial(props.onChange, 'host')} value={props.host}/>
          <input name="port" onChange={_.partial(props.onChange, 'port')} value={props.port}/>
          <input name="database" onChange={_.partial(props.onChange, 'database')} value={props.database}/>
          <input name="username" onChange={_.partial(props.onChange, 'username')} value={props.username}/>
          <input name="password" onChange={_.partial(props.onChange, 'password')} value={props.password}/>
          <input name="ssh" onChange={_.partial(props.onChange, 'ssh')} type="checkbox" value={props.ssh}/>
        </form>
      </div>
    );
  }
});
