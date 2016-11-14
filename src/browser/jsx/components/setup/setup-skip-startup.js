import React from 'react';
import commonReact from '../../services/common-react';
import './setup-skip-startup.css';

export default React.createClass({
  displayName: 'SetupSkipStartup',
  propTypes: {
    onSkipStartup: React.PropTypes.func,
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = ['setup-skip-startup'];

    if (props.isMainWindowReady) {
      className.push('setup-skip-startup--visible');
    }

    return (
      <div className={className.join(' ')}>
        <button className="btn btn-default" onClick={props.onSkipStartup}>{props.text.skipStartup}</button>
      </div>
    );
  }
});
