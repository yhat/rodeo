import _ from 'lodash';
import React from 'react';
import PlotPreview from '../../components/plot-preview/plot-preview.jsx';
import {connect} from 'react-redux';
import actions from './plot-viewer.actions';

/**
 * We only need plots
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  return _.pick(state, ['plots']);
}

/**
 *
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onDelete: () => dispatch(actions.removeActivePlot()),
    onNext: () => dispatch(actions.focusNextPlot()),
    onPrev: () => dispatch(actions.focusPrevPlot()),
    onSave: () => dispatch(actions.saveActivePlot()),
    onOpen: () => dispatch(actions.openActivePlot()),
    onItemClick: (id) => dispatch(actions.focusPlot(id))
  };
}

/**
 * @class PlotViewer
 * @extends ReactComponent
 * @property props
 * @property {Array} props.plots
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'PlotViewer',
  render: function () {
    return <PlotPreview {...this.props}/>;
  }
}));
