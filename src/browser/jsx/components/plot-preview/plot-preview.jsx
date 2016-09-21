import _ from 'lodash';
import React from 'react';
import ForegroundPlot from './foreground-plot.jsx';
import BackgroundPlot from './background-plot.jsx';
import './plot-preview.css';
import commonReact from '../../services/common-react';
import EmptySuggestion from '../empty/empty-suggestion';

/**
 * @class PlotPreview
 * @extends ReactComponent
 * @property props
 * @property {Array} props.plots
 */
export default React.createClass({
  displayName: 'PlotPreview',
  propTypes: {
    active: React.PropTypes.string,
    onFocusPlot: React.PropTypes.func.isRequired,
    onRemovePlot: React.PropTypes.func.isRequired,
    onSavePlot: React.PropTypes.func.isRequired,
    plots: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props;

    function getActivePlotComponent(plot) {
      let plotComponent;

      if (plot && plot.data) {
        plotComponent = <ForegroundPlot data={plot.data} id={plot.id} />;
      } else if (props.plots && props.plots.length > 0) {
        plotComponent = <EmptySuggestion label="Select a plot."/>;
      } else {
        plotComponent = <EmptySuggestion label="Create a plot."/>;
      }

      return plotComponent;
    }

    return (
      <section className="plot-preview">
        {getActivePlotComponent(_.find(props.plots, {id: props.active}))}

        <nav>
          {props.plots.map((plot) => {
            return (
              <BackgroundPlot
                active={props.active === plot.id}
                key={plot.id}
                onClick={_.partial(props.onFocusPlot, plot)}
                onRemove={_.partial(props.onRemovePlot, plot)}
                onSave={_.partial(props.onSavePlot, plot)}
                {...plot}
              />
            );
          })}
        </nav>
      </section>
    );
  }
});
