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
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    className.push('font-sans');

    return <div className={className.join(' ')}><Marked>{props.label}</Marked></div>;
  }
});
