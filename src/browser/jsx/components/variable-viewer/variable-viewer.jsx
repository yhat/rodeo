import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {Table, Column, Cell} from 'fixed-data-table-2';
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
import globalObserver from '../../services/global-observer';
import './variable-viewer.css';
import commonReact from '../../services/common-react';

const structuredVariableTypes = ['DataFrame'];

/**
 * @class PackagesViewer
 * @extends ReactComponent
 * @property {object} state
 * @property {object} props
 */
export default React.createClass({
  displayName: 'VariableViewer',
  propTypes: {
    filter: React.PropTypes.string,
    onShowDataFrame: React.PropTypes.func,
    options: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      height: 30,
      rowHeight: 30,
      width: 100 * 3,
      columnWidths: {
        name: 150,
        type: 150,
        value: 150
      }
    };
  },
  componentDidMount: function () {
    _.defer(() => this.resize());
    globalObserver.on('resize', this.resize, this);
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    return !commonReact.shallowEqual(this.props, nextProps, nextState);
  },
  componentWillUnmount: function () {
    globalObserver.off(null, null, this);
  },
  handleColumnResize: function (newColumnWidth, columnKey) {
    const columnWidths = this.state.columnWidths;

    columnWidths[columnKey] = newColumnWidth;

    this.setState({columnWidths});
  },
  resize: function () {
    const el = ReactDOM.findDOMNode(this),
      height = el.parentNode.offsetHeight,
      width = el.offsetWidth;

    this.setState({
      height,
      width
    });
  },
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
      <div className="variable-viewer" style={style}>
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
});
