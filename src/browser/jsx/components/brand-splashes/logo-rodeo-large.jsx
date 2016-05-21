import React from 'react';
import logo from './logo-rodeo-grey-text.svg';

/**
 * @class BrandSplash
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'BrandSplash',
  render: function () {
    return <img src={logo} />;
  }
});
