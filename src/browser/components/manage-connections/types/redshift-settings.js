import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';

export default React.createClass({
  displayName: 'RedshiftSettings',
  propTypes: {
    id: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    types: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleNoop: function (event) {
    event.preventDefault();
  },
  handleChange: function (key, event) {
    const id = this.props.id,
      value = event.target.value;

    this.props.onChange({id, key, value});
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <form onSubmit={this.handleNoop}>
          <div className="layout-buttons--align-right">
            <button className="btn btn-success">{'Connect'}</button>
          </div>
          <hr />
          <div className="layout-label-input layout-50-50">
            <label>
              {'Nickname'}
              <input name="name" onChange={_.partial(this.handleChange, 'name')} value={props.name || ''}/>
            </label>
            <label>
              {'Type'}
              <select name="type" onChange={_.partial(this.handleChange, 'type')} value={props.type || ''}>
                {_.map(props.types, type => <option value={type.name}>{type.label}</option>)}
              </select>
            </label>
          </div>
          <div className="layout-label-input layout-75-25">
            <label>
              {'Hostname'}
              <input name="host" onChange={_.partial(this.handleChange, 'host')} value={props.host || ''}/>
            </label>
            <label>
              {'Port'}
              <input name="port" onChange={_.partial(this.handleChange, 'port')} value={props.port || ''}/>
            </label>
          </div>
          <div className="layout-label-input layout-100">
            <label>
              {'Database'}
              <input name="database" onChange={_.partial(this.handleChange, 'database')} value={props.database || ''}/>
            </label>
          </div>
          <div className="layout-label-input layout-50-50">
            <label>
              {'User'}
              <input name="username" onChange={_.partial(this.handleChange, 'username')} value={props.username || ''}/>
            </label>
            <label>
              {'Password'}
              <input name="password" onChange={_.partial(this.handleChange, 'password')} value={props.password || ''}/>
            </label>
          </div>
        </form>
      </div>
    );
  }
});
