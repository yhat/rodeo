import React from 'react';
import UnsafeHTML from '../unsafe-html.jsx';
import './plot-preview.css';

/**
 * @class ForegroundPlot
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'ForegroundPlot',
  propTypes: {
    data: React.PropTypes.object.isRequired,
    id: React.PropTypes.string.isRequired
  },
  render: function () {
    const props = this.props,
      data = props.data;
    let plotComponent;


    if (data['image/png']) {
      plotComponent = <div><img src={data['image/png']}/></div>;
    } else if (data['image/svg']) {
      plotComponent = <div><img src={data['image/svg']}/></div>;
    } else if (data['text/html']) {
      let frameId = 'frame-' + props.id;

      plotComponent = <UnsafeHTML id={frameId} src={data['text/html']} />;
    } else {
      plotComponent = <div className="suggestion">{'Plot must be png, svg, html or javascript.'}</div>;
    }

    return plotComponent;
  }
});
