import React from 'react';
import './detected-python-badge.css';

const mainClass = 'detected-python-badge';

/**
 * @class DetectedPythonBadge
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'DetectedPythonBadge',
  propTypes: {
    validity: React.PropTypes.oneOf(['good', 'bad', 'ugly'])
  },
  render: function () {
    const props = this.props,
      className = [mainClass];

    if (props.validity) {
      className.push(props.validity);
    }

    return (
      <div className={className.join(' ')}></div>
    );
  }
});
