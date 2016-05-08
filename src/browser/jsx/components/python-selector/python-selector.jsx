import React from 'react';
import PythonSelectorItem from './python-selector-item';

/**
 * @class PythonSelector
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PythonSelector',
  propTypes: {
    onSelect: React.PropTypes.func.isRequired,
    pythonDefinitions: React.PropTypes.array.isRequired,
    showDescription: React.PropTypes.bool,
    showVersion: React.PropTypes.bool
  },
  handleClick: function () {
    this.props.onSelect(this, arguments);
  },
  render: function () {
    let list = this.props.pythonDefinitions.map((pythonDefinition, i) => {
      return (
        <PythonSelectorItem key={i}
          onClick={this.handleClick}
          pythonDefinition={pythonDefinition}
          {...this.props}
        />
      );
    });

    return (
      <div className="python-selector">
        <div className="python-selector-list">{list}</div>
      </div>
    );
  }
});
