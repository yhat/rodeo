import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import './plot-viewer.less';
import htmlSplash from './html-flat.svg';
import errorSplash from './document-error-flat.svg';

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
    onDelete: () => dispatch({type: 'REMOVE_ACTIVE_PLOT'}),
    onNext: () => dispatch({type: 'FOCUS_NEXT_PLOT'}),
    onPrev: () => dispatch({type: 'FOCUS_PREV_PLOT'}),
    onSave: () => dispatch({type: 'SAVE_ACTIVE_PLOT'}),
    onOpen: () => dispatch({type: 'OPEN_ACTIVE_PLOT'})
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'PlotViewer',
  propTypes: {
    onDelete: React.PropTypes.func,
    onNext: React.PropTypes.func,
    onPrev: React.PropTypes.func,
    onSave: React.PropTypes.func,
    onZoomIn: React.PropTypes.func,
    plots: React.PropTypes.array
  },
  getDefaultProps: function () {
    return {
      onDelete: _.noop,
      onNext: _.noop,
      onPrev: _.noop,
      onSave: _.noop,
      onShow: _.noop
    };
  },
  render: function () {
    const props = this.props;

    function getActivePlotComponent(plot) {
      let plotComponent,
        data = plot && plot.data;

      if (data) {
        if (data['image/png']) {
          plotComponent = <img src={data['image/png']}/>;
        } else if (data['image/svg']) {
          plotComponent = <img src={data['image/svg']}/>;
        } else if (data['text/html']) {
          plotComponent = <iframe docsrc={data['text/html']} sandbox=""></iframe>;
        } else {
          plotComponent = <div className="suggestion">{'Plot must be png, svg, html or javascript.'}</div>;
        }
      } else if (props.plots && props.plots.length > 0) {
        plotComponent = <div className="suggestion">{'Select a plot.'}</div>;
      } else {
        plotComponent = <div className="suggestion">{'Create a plot.'}</div>;
      }

      return plotComponent;
    }

    function getMinimapPlotComponent(plot) {
      let plotComponent,
        data = plot && plot.data;

      if (data) {
        if (data['image/png']) {
          plotComponent = <img src={data['image/png']}/>;
        } else if (data['image/svg']) {
          plotComponent = <img src={data['image/svg']}/>;
        } else if (data) {
          plotComponent = <img src={htmlSplash}/>;
        } else {
          plotComponent = <img src={errorSplash}/>;
        }
      }

      return plotComponent;
    }

    return (
      <section className="plot-viewer">
        <header>
          <a className="label label-primary" onClick={props.onPrev} title="Previous Plot">
            <span className="fa fa-undo"/>
          </a>
          <a className="label label-primary" onClick={props.onNext} title="Next Plot">
            <span className="fa fa-repeat"/>
          </a>
          <a className="label label-primary" onClick={props.onOpen} title="Zoom In">
            <span className="fa fa-arrows-alt"/>
          </a>
          <a className="label label-primary" onClick={props.onSave} title="Export Plot">
            <span className="fa fa-floppy-o"/>
          </a>
          <a className="label label-primary" onClick={props.onDelete} title="Delete Plot">
            <span className="fa fa-trash-o"/>
          </a>
        </header>

        {getActivePlotComponent(_.find(props.plots, {hasFocus: true}))}

        <nav className="plot-viewer-minimap">
          {getMinimapPlotComponent(props.plots)}
        </nav>
      </section>
    );
  }
}));