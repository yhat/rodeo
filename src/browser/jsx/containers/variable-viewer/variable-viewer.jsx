import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import variableViewerActions from './variable-viewer.actions';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  // pick the first terminal (we can add more later to this view?)
  return _.pick(_.head(state.terminals) || {}, ['variables']);
}

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onShowDataFrame: item => dispatch(variableViewerActions.showDataFrame(item))
  };
}

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
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
              <th>{'Name'}</th>
              <th>{'Type'}</th>
              <th>{'REPR'}</th>
              <th>{'Value'}</th>
            </tr>
          </thead>
          <tbody>
          {_.map(items, item => {
            let value;

            console.log('variableViewer', 'item', item);

            if (item.type === 'List') {
              value = <button className="btn btn-default" onClick={_.partial(this.props.onShowDataFrame, item)}>{'View'}</button>;
            }

            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>{item.repr}</td>
                <td>{value}</td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    );
  }
}));
