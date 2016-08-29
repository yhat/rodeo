import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {Table, Column, Cell} from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
import globalObserver from '../../services/global-observer';
import DataFrameLoadingIcon from './data-frame-loading-icon.jsx';
import './data-frame.css';

/**
 * @class DataFrame
 * @extends ReactComponent
 * @property {object} state
 * @property {object} props
 */
export default React.createClass({
  displayName: 'DataFrame',
  propTypes: {
    data: React.PropTypes.object,
    filter: React.PropTypes.string,
    id: React.PropTypes.string,
    isLoading: React.PropTypes.bool
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
  },
  componentDidMount: function () {
    _.defer(() => this.resize());
    globalObserver.on('resize', this.resize, this);
  },
  componentWillReceiveProps: function () {
    this.onNewData();
  },
  shouldComponentUpdate: function () {
    return true;
  },
  componentWillUnmount: function () {
    globalObserver.off(null, null, this);
  },
  handleColumnResize: function (newColumnWidth, columnKey) {
    const columnWidths = this.state.columnWidths;

    if (newColumnWidth < 70) {
      newColumnWidth = 70;
    }

    columnWidths[columnKey] = newColumnWidth;

    this.setState({
      columnWidths
    });
  },
  onNewData: function () {
    const props = this.props,
      data = props.data,
      columns = data && data.columns,
      columnWidths = this.state.columnWidths;

    if (props.data) {
      _.each(columns, function (columnName) {
        // guarantee a width of something or 100
        columnWidths[columnName] = columnWidths[columnName] || 100;
      });

      this.setState({columnWidths});
    }
  },
  resize: function () {
    const el = ReactDOM.findDOMNode(this),
      height = el.parentNode.offsetHeight,
      width = el.parentNode.offsetWidth;

    if (this.state.height !== height || this.state.width !== width) {
      this.setState({
        height,
        width
      });
    }
  },
  render: function () {
    const props = this.props,
      state = this.state,
      data = props.data,
      columns = data && data.columns || [],
      rows = data && data.data || [];

    return (
      <div className="data-frame-container">
        <Table
          className="data-frame-table"
          headerHeight={state.rowHeight}
          height={state.height}
          isColumnResizing={false}
          onColumnResizeEndCallback={this.handleColumnResize}
          rowHeight={state.rowHeight}
          rowsCount={rows.length}
          width={state.width}
        >
          {_.map(columns, (column, columnIndex) => {
            if (column !== undefined && state.columnWidths[column]) {

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
                  header={<Cell>{column}</Cell>}
                  isResizable
                  minWidth={70}
                  width={state.columnWidths[column]}
                />
              );
            }
          })}
        </Table>
        <DataFrameLoadingIcon isLoading={props.isLoading} label="Loading DataFrame" />
      </div>
    );
  }
});
