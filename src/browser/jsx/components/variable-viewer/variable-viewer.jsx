import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  // pick the first terminal (we can add more later to this view?)
  return _.pick(_.head(state.terminals) || {}, ['variables']);
}

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default connect(mapStateToProps)(React.createClass({
  displayName: 'VariableViewer',
  propTypes: {
    variables: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      filter: ''
    };
  },
  handleFilterChange: _.debounce(function () {
    const value = this.refs.filter.value;

    this.setState({filter: value ? value.toLowerCase() : ''});
  }, 300),
  render: function () {
    const props = this.props,
      state = this.state;
    let items;

    // flatten type with the rest; give a unique id to use as the key
    items = _.flatten(_.map(props.variables, function (list, type) {
      type = _.startCase(type);
      return _.map(list, function (variable) {
        return _.assign({
          type,
          id: type + ' ' + variable.name
        }, variable);
      });
    }));

    console.log('items', items);

    items = _.filter(items, item => !state.filter || (
      item.name.toLowerCase().indexOf(state.filter.toLowerCase()) > -1 ||
      item.type.toLowerCase().indexOf(state.filter.toLowerCase()) > -1 ||
      item.repr.toLowerCase().indexOf(state.filter.toLowerCase()) > -1
    ));

    return (
      <div>
        <div className="row">
          <div className="col-sm-5 col-sm-offset-7">
            <div className="input-group">
              <div className="input-group-addon">
                <span className="fa fa-search"/>
              </div>
              <input
                className="form-control input-sm"
                onChange={this.handleFilterChange}
                ref="filter"
              />
            </div>
          </div>
        </div>
        <table className="table table-bordered">
          <thead>
          <tr>
            <th>{'Name'}</th><th>{'Type'}</th><th>{'REPR'}</th>
          </tr>
          </thead>
          <tbody>
          {_.map(items, item => <tr key={item.id}><td>{item.name}</td><td>{item.type}</td><td>{item.repr}</td></tr>)}
          </tbody>
        </table>
      </div>
    );
  }
}));
