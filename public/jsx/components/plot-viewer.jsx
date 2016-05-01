import React from 'react';

export default React.createClass({
  displayName: 'PlotViewer',
  propTypes: {
    onDelete: React.PropTypes.func,
    onNext: React.PropTypes.func,
    onPrev: React.PropTypes.func,
    onSave: React.PropTypes.func,
    onShow: React.PropTypes.func
  },
  render: function () {
    return (
      <div>
        <a className="label label-primary"
          onClick={this.props.onPrev}
          title="Prevous Plot"
        ><i className="fa fa-undo"/>
        </a>
        <a className="label label-primary"
          onClick={this.props.onNext}
          title="Next Plot"
        ><i className="fa fa-repeat"/>
        </a>
        <a className="label label-primary"
          onClick={this.props.onShow}
          title="Zoom In"
        ><i className="fa fa-arrows-alt"/>
        </a>
        <a className="label label-primary"
          onClick={this.props.onSave}
          title="Export Plot"
        ><i className="fa fa-floppy-o"/>
        </a>
        <a className="label label-primary"
          onClick={this.props.onDelete}
          title="Delete Plot"
        ><i className="fa fa-trash-o"/>
        </a>
        <div className="row">
          <div className="col-sm-10"
            id="plots"
          ></div>
          <div className="col-sm-2 pull-right"
            id="plots-minimap"></div>
        </div>
      </div>
    );
  }
});