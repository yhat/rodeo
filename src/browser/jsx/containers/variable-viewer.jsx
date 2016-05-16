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
    filter: React.PropTypes.string,
    variables: React.PropTypes.object
  },
  render: function () {
    const props = this.props;
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

    items = _.filter(items, item => !props.filter || (
      item.name.toLowerCase().indexOf(props.filter.toLowerCase()) > -1 ||
      item.type.toLowerCase().indexOf(props.filter.toLowerCase()) > -1 ||
      item.repr.toLowerCase().indexOf(props.filter.toLowerCase()) > -1
    ));

    return (
      <div>
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
