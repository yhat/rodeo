var TourItem = window.TourItem = React.createClass({
  render: function() {
    var style = {
      maxWidth: '100%',
      maxHeight: '250px'
    };
    var img = <img src={this.props.img} style={style} />
    if (this.props.img2) {
      img = (
        <div className="row">
          <div className="col-sm-6">
            <img src={this.props.img} style={style} />
          </div>
          <div className="col-sm-6">
            <img src={this.props.img2} style={style} />
          </div>
        </div>
      );
    }
    return (
      <div className="text-center">
        <h3 className="text-primary">{this.props.title}</h3>
        {img}
        <br /><br />
        <p className="lead" dangerouslySetInnerHTML={ {__html: this.props.subtitle } }></p>
      </div>
    );
  }
});