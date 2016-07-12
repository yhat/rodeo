import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {Table, Column, Cell} from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
import globalObserver from '../../services/global-observer';

export default React.createClass({
  displayName: 'DataFrameViewer',
  propTypes: {
    data: React.PropTypes.object,
    filter: React.PropTypes.string,
    id: React.PropTypes.string
  },
  getInitialState: function () {
    return {
      height: 300,
      rowHeight: 30,
      width: 300,
      columnWidths: {}
    };
  },
  componentWillMount: function () {
    this.onNewData();
    this.onResize();
  },
  componentDidMount: function () {
    globalObserver.on('resize', this.onResize, this);
  },
  componentWillReceiveProps: function () {
    this.onNewData();
    this.onResize();
  },
  shouldComponentUpdate: function (nextProps, nextState) {
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
  onNewData: function () {
    const columns = _.get(this.props, 'data.columns'),
      columnWidths = this.state.columnWidths;

    _.each(columns, function (columnName) {
      // guarantee a width of something or 100
      columnWidths[columnName] = columnWidths[columnName] || 100;
    });

    this.setState({columnWidths});
  },
  onResize: function () {
    const el = ReactDOM.findDOMNode(this),
      height = el.parentNode.offsetHeight,
      width = el.parentNode.offsetWidth;

    console.log('DATAFRAME TABLE', width, height, el.parentNode, this);

    this.setState({
      height,
      width
    });
  },
  render: function () {
    const props = this.props,
      state = this.state,
      columns = props.data && props.data.columns,
      rows = props.data && props.data.data;

    return (
      <Table
        headerHeight={state.rowHeight}
        height={state.height}
        isColumnResizing={false}
        onColumnResizeEndCallback={this.handleColumnResize}
        rowHeight={state.rowHeight}
        rowsCount={rows.length}
        width={state.width}
      >
        {_.map(columns, (column, columnIndex) => {
          if (column && state.columnWidths[column]) {
            const flexGrow = (columns.length - 1) === columnIndex ? 1 : 0;

            return (
              <Column
                allowCellsRecycling
                cell={({rowIndex}) => {
                  const value = rows[rowIndex][columnIndex];

                  return (
                    <Cell {...props}>{value}</Cell>
                  );
                }}
                columnKey={column}
                flexGrow={flexGrow}
                header={<Cell>{column}</Cell>}
                isResizable
                minWidth={70}
                width={state.columnWidths[column]}
              />
            );
          }
        })}
      </Table>
    );
  }
});
