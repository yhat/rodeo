import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {Table, Column, Cell} from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
import variableViewerActions from './variable-viewer.actions';
import globalObserver from '../../services/global-observer';

const structuredVariableTypes = ['DataFrame', 'Series', 'List', 'Dict', 'Array'];

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
      width: 100 * 3,
      columnWidths: {
        name: 100,
        type: 100,
        value: 100
      }
    };
  },
  componentDidMount: function () {
    globalObserver.on('resize', this.onResize, this);
  },
  shouldComponentUpdate: function (nextState) {
    const state = this.state;

    return !(state.height === nextState.height && state.width === nextState.width);
  },
  componentWillUnmount: function () {
    globalObserver.off(null, null, this);
  },
  handleColumnResize: function (newColumnWidth, columnKey) {
    const columnWidths = this.state.columnWidths;

    columnWidths[columnKey] = newColumnWidth;

    this.setState({
      columnWidths
    });
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
      item.repr.toLowerCase().indexOf(props.filter.toLowerCase()) > -1 ||
      (item && item.value && item.value.toString().indexOf(props.filter.toLowerCase()) > -1)
    ));

    return (
      <div style={style}>
        <Table
          headerHeight={state.rowHeight}
          height={state.height}
          isColumnResizing={false}
          onColumnResizeEndCallback={this.handleColumnResize}
          rowHeight={state.rowHeight}
          rowsCount={items.length}
          width={state.width}
        >
          <Column
            allowCellsRecycling
            cell={({rowIndex}) => (
              <Cell {...props}>{items[rowIndex].name}</Cell>
            )}
            columnKey="name"
            header={<Cell>{'Name'}</Cell>}
            isResizable
            minWidth={70}
            width={state.columnWidths.name}
          />
          <Column
            allowCellsRecycling
            cell={({rowIndex}) => (
              <Cell {...props}>{items[rowIndex].repr}</Cell>
            )}
            columnKey="type"
            header={<Cell>{'Type'}</Cell>}
            isResizable
            minWidth={70}
            width={state.columnWidths.type}
          />
          <Column
            allowCellsRecycling
            cell={({rowIndex}) => {
              let value,
                item = items[rowIndex];

              if (item.value) {
                value = item.value;
              } else if (_.includes(structuredVariableTypes, item.type)) {
                value = <button className="actionest fa fa-table" onClick={_.partial(props.onShowDataFrame, item)} />;
              }

              return <Cell>{value}</Cell>;
            }}
            columnKey="value"
            flexGrow={1}
            header={<Cell>{'Value'}</Cell>}
            isResizable
            minWidth={70}
            width={state.columnWidths.value}
          />
        </Table>
      </div>
    );
  }
}));
