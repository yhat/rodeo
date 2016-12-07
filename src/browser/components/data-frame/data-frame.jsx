import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {Table, Column, Cell} from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
import globalObserver from '../../services/global-observer';
import DataFrameLoadingIcon from './data-frame-loading-icon.jsx';
import './data-frame.css';
import commonReact from '../../services/common-react';

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
    isLoading: React.PropTypes.bool,
    visible: React.PropTypes.bool.isRequired
  },
  getInitialState: function () {
    return {
      height: 300,
      rowHeight: 30,
      width: 300,
      columnWidths: {}
    };
  },
  componentDidMount: function () {
    this.resize();
    globalObserver.on('resize', this.resize, this);
  },
  componentWillReceiveProps: function (nextProps) {
    if (!this.props.visible && nextProps.visible) {
      _.defer(() => this.resize());
    }

    if (!this.props.data && nextProps.data) {
      this.onNewData(nextProps.data);
    }
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    return commonReact.shouldComponentUpdate(this, nextProps, nextState);
  },
  componentWillUnmount: function () {
    globalObserver.off(null, null, this);
  },
  handleColumnResize: function (newColumnWidth, columnKey) {
    const columnWidths = _.clone(this.state.columnWidths);

    if (newColumnWidth < 70) {
      newColumnWidth = 70;
    }

    columnWidths[columnKey] = newColumnWidth;

    this.setState({columnWidths});
  },
  onNewData: function (data) {
    const columns = data && data.columns,
      columnWidths = _.clone(this.state.columnWidths);

    _.each(columns, function (columnName) {
      // guarantee a width of something or 100
      columnWidths[columnName] = columnWidths[columnName] || 100;
    });

    this.setState({columnWidths});

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
    let loadingIcon;

    if (props.isLoading) {
      loadingIcon = <DataFrameLoadingIcon isLoading={props.isLoading} label="Loading DataFrame" />;
    }


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
        {loadingIcon}
      </div>
    );
  }
});
