import React from 'react';

export default React.createClass({
  displayName: 'TourItem',
  propTypes: {
    img: React.PropTypes.string.isRequired,
    img2: React.PropTypes.string.isRequired,
    subtitle: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  },
  getDefaultProps: function () {
    return {
      img: '',
      img2: '',
      title: ''
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
    /* eslint react/no-danger:0 */
    return (
      <div className="text-center">
        <h3 className="text-primary">{this.props.title}</h3>
        {img}
        <br /><br />
        <p className="lead" dangerouslySetInnerHTML={{__html: this.props.subtitle }}/>
      </div>
    );
  }
});
