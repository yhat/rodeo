var TourItem = window.TourItem = React.createClass({
  propTypes: {
    img: React.PropTypes.string,
    img2: React.PropTypes.string,
    subtitle: React.PropTypes.string,
    title: React.PropTypes.title
  },
  getDefaultProps: function () {
    return {
      img: '',
      img2: '',
      title: '',
      subtitle: ''
    };
  },
  render: function () {
    let style, img;

    style = {
      maxWidth: '100%',
      maxHeight: '250px'
    };
    img = (
      <img src={this.props.img}
        style={style}
      />
    );
    if (this.props.img2) {
      img = (
        <div className="row">
          <div className="col-sm-6">
            <img src={this.props.img}
              style={style}
            />
          </div>
          <div className="col-sm-6">
            <img src={this.props.img2}
              style={style}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="text-center">
        <h3 className="text-primary">{this.props.title}</h3>
        {img}
        <br /><br />
        <p className="lead">{this.props.subtitle}</p>
      </div>
    );
  }
});