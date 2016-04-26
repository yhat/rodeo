// <h1>Rodeo is starting up...</h1>
// <p className="lead">We're launching your python session. This should only take a moment or two.</p>
const LoadingWidget = window.LoadingWidget = React.createClass({
  render: function () {
    var style = {
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
        <img src="img/loading.gif"
          style={style}
        />
        <br />
        <br />
        <br />
        <p className="lead">{'Starting up...'}</p>
      </div>
    );
  }
});
