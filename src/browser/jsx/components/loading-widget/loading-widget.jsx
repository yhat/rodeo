import React from 'react';
import loadingWidget from './loading.gif';

/**
 * @class LoadingWidget
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'LoadingWidget',
  render: function () {
    const style = {
      height: '200px'
    };

    return (
      <div className="text-center">
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <img src={loadingWidget} style={style}/>
        <br />
        <br />
        <br />
        <p className="lead">{'Starting up...'}</p>
      </div>
    );
  }
});
