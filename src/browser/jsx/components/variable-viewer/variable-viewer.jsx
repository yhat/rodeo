import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
import globalObserver from '../../services/global-observer';
import './variable-viewer.css';
import commonReact from '../../services/common-react';
import EmptySuggestion from '../empty/empty-suggestion';
import VariableTable from './variable-table.jsx';

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
    onShowDataFrame: React.PropTypes.func.isRequired,
    variables: React.PropTypes.object,
    visible: React.PropTypes.bool.isRequired
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
  shouldComponentUpdate: function (nextProps, nextState) {
    return commonReact.shouldComponentUpdate(this, nextProps, nextState);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      content = [];


    if (!props.variables) {
      content.push(<EmptySuggestion label="Assign a variable." />);
    } else {
      content.push(<VariableTable {...props} />);
    }

    return <div className={className.join(' ')}>{content}</div>;
  }
});
