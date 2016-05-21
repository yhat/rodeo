import React from 'react';
import LogoRodeoLarge from '../brand-splashes/logo-rodeo-large.jsx';
import './setup-ready.css';

/**
 * @class SetupReady
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'SetupReady',
  propTypes: {
    onOK: React.PropTypes.func.isRequired
  },
  render: function () {
    return (
      <section className="setup-ready">
        <LogoRodeoLarge />
        <div>
          <button className="btn btn-default" onClick={this.props.onOK}>{'Ready to Rodeo!'}</button>
        </div>
      </section>
    );
  }
});
