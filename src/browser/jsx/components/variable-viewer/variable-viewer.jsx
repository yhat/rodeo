import _ from 'lodash';
import React from 'react';
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
  shouldComponentUpdate: function (nextProps, nextState) {
    return commonReact.shouldComponentUpdate(this, nextProps, nextState);
  },
  render: function () {
    const props = this.props;
    let content;

    if (props.variables && _.some(props.variables, variable => variable.length > 0)) {
      content = <VariableTable {...props} />;
    } else {
      content = <EmptySuggestion label="Assign a variable."/>;
    }

    return content;
  }
});
