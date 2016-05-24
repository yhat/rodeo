import React from 'react';
import logo from './logo-rodeo-grey-text.svg';
import './brand-splashes.css';

/**
 * @class BrandSplash
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'BrandSplash',
  render: function () {
    // const style = {
    //   backgroundImage: `url(${logo})`,
    //   backgroundRepeat: 'no-repeat',
    //   backgroundSize: 'contain',
    //   display: 'block',
    //   height: '100%'
    // };

    return <img className="brand-splash" src={logo} />;
  }
});
