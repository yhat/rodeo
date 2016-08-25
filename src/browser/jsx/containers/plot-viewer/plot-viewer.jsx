import _ from 'lodash';
import React from 'react';
import PlotPreview from '../../components/plot-preview/plot-preview.jsx';
import {connect} from 'react-redux';
import actions from './plot-viewer.actions';

/**
 *
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onDelete: () => dispatch(actions.removeActivePlot()),
    onItemClick: plot => dispatch(actions.focus(plot)),
    onItemRemove: plot => dispatch(actions.remove(plot)),
    onItemSave: plot => dispatch(actions.save(plot)),
    onNext: () => dispatch(actions.focusNextPlot()),
    onPrev: () => dispatch(actions.focusPrevPlot()),
    onSave: () => dispatch(actions.saveActivePlot()),
    onOpen: () => dispatch(actions.openActivePlot())
  };
}

/**
 * @class PlotViewer
 * @extends ReactComponent
 * @property props
 * @property {Array} props.plots
 */
export default connect(state => state, mapDispatchToProps)(React.createClass({
  displayName: 'PlotViewer',
  render: function () {
    return <PlotPreview {...this.props}/>;
  }
}));
