import React from 'react';
import PlotPreview from '../../components/plot-preview/plot-preview.jsx';
import commonReact from '../../services/common-react';

/**
 * @class PlotViewer
 * @extends ReactComponent
 * @property props
 * @property {Array} props.plots
 */
export default React.createClass({
  displayName: 'PlotViewer',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    return <PlotPreview {...this.props}/>;
  }
});
