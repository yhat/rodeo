import React from 'react';
import logo from './logo-rodeo-square-large.svg';
import './brand-splashes.css';

/**
 * @class BrandSplash
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'BrandSplash',
  render: function () {
    return <img className="brand-splash" src={logo} />;
  }
});
