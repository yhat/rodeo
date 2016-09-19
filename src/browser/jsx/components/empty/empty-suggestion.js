import React from 'react';
import './empty-suggestion.css';
import commonReact from '../../services/common-react';
import Marked from '../marked/marked.jsx';

/**
 * @class PlotPreview
 * @extends ReactComponent
 * @property props
 * @property {Array} props.plots
 */
export default React.createClass({
  displayName: 'EmptySuggestion',
  propTypes: {
    label: React.PropTypes.string.isRequired
  },
  shouldComponentUpdate: function () {
    return false;
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    console.log('EmptySuggestion', 'render', props);

    return <div className={className}><Marked>{props.label}</Marked></div>;
  }
});
