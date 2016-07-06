import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {Table, Column, Cell} from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
import variableViewerActions from './variable-viewer.actions';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  // pick the first terminal (we can add more later to this view?)
  const terminal = _.head(state.terminals),
    variables = terminal && terminal.variables,
    splitPanes = state.splitPanes;

  return _.pickBy({variables, splitPanes}, _.identity);
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
    splitPanes: React.PropTypes.object.isRequired,
    variables: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      height: 30,
      rowHeight: 30,
      width: 30
    };
  },
  componentDidMount: function () {
    window.addEventListener('focus', this.onResize);
    _.defer(() => this.onResize());
  },
  componentWillReceiveProps: function () {
    this.onResize();
  },
  shouldComponentUpdate: function (nextState) {
    const state = this.state;

    return !(state.height === nextState.height && state.width === nextState.width);
  },
  componentWillUnmount: function () {
    window.removeEventListener('focus', this.onResize);
  },
  onResize: _.throttle(function () {
    const el = ReactDOM.findDOMNode(this),
      height = el.parentNode.offsetHeight,
      width = el.offsetWidth;

    this.setState({
      height,
      width
    });
  }, 50),
  render: function () {
    const props = this.props,
      state = this.state,
      style = {
        height: '100%'
      };
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
      <div style={style}>
        <Table
          headerHeight={state.rowHeight}
          height={state.height}
          rowHeight={state.rowHeight}
          rowsCount={items.length}
          width={state.width}
        >
          <Column
            cell={({rowIndex}) => (
              <Cell {...props}>{items[rowIndex].name}</Cell>
            )}
            header={<Cell>{'Name'}</Cell>}
            width={state.width / 4}
          />
          <Column
            cell={({rowIndex}) => (
              <Cell {...props}>{items[rowIndex].repr}</Cell>
            )}
            header={<Cell>{'Type'}</Cell>}
            width={state.width / 4}
          />
          <Column
            cell={({rowIndex}) => (
              <Cell>{items[rowIndex].value}</Cell>
            )}
            header={<Cell>{'Value'}</Cell>}
            width={state.width / 2}
          />
        </Table>
      </div>
    );
  }
}));
