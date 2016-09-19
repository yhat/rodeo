import _ from 'lodash';
import React from 'react';
import PlotPreview from '../../components/plot-preview/plot-preview.jsx';
import {connect} from 'react-redux';
import actions from './plot-viewer.actions';
import commonReact from '../../services/common-react';

/**
 *
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onItemClick: plot => dispatch(actions.focus(plot)),
    onItemRemove: plot => dispatch(actions.remove(plot)),
    onItemSave: plot => dispatch(actions.save(plot)),
    onOpen: () => dispatch(actions.openActivePlot())
  };
}

/**
 * @class PlotViewer
 * @extends ReactComponent
 * @property props
 * @property {Array} props.plots
 */
export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'PlotViewer',
  shouldComponentUpdate: function (nextProps) {
    console.log('PlotViewer', 'shouldComponentUpdate', !commonReact.shallowEqual(this, nextProps));
    return !commonReact.shallowEqual(this, nextProps);
  },
  render: function () {
    console.log('PlotViewer', 'render', this.props);

    return <PlotPreview {...this.props}/>;
  }
}));
