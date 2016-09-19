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
    onItemClick: React.PropTypes.func.isRequired,
    onItemRemove: React.PropTypes.func.isRequired,
    onItemSave: React.PropTypes.func.isRequired,
    plots: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    console.log('PlotPreview', 'shouldComponentUpdate', !commonReact.shallowEqual(this, nextProps));
    return !commonReact.shallowEqual(this, nextProps);
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

    console.log('PlotPreview', 'render', props);

    return (
      <section className="plot-preview">
        {getActivePlotComponent(_.find(props.plots, {id: props.active}))}

        <nav>
          {props.plots.map((plot) => {
            return (
              <BackgroundPlot
                active={props.active === plot.id}
                key={plot.id}
                onClick={_.partial(props.onItemClick, plot)}
                onRemove={_.partial(props.onItemRemove, plot)}
                onSave={_.partial(props.onItemSave, plot)}
                {...plot}
              />
            );
          })}
        </nav>
      </section>
    );
  }
});
