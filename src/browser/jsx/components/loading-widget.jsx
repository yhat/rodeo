import React from 'react';

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
        <img src="img/loading.gif" style={style}/>
        <br />
        <br />
        <br />
        <p className="lead">{'Starting up...'}</p>
      </div>
    );
  }
});
