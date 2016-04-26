/* globals React, DocCode */
'use strict';

const SetupJupyter = window.SetupJupyter = React.createClass({
  propTypes: {
    onNewPythonPath: React.PropTypes.func.isRequired,
    onOpenDocs: React.PropTypes.func.isRequired,
    onOpenTerminal: React.PropTypes.func.isRequired,
    pythonPath: React.PropTypes.string.isRequired
  },
  handleTestPythonPath: function () {
    this.props.onNewPythonPath(this.props.pythonPath);
  },
  handleChangePath: function () {
    this.props.onNewPythonPath('NEW PATH');
  },
  render: function () {
    return (
      <div className="row">
        <h2>{'Looks like you\'re missing '}<i>{'jupyter'}</i></h2>
        <p className="lead">
          <a onClick={this.props.onOpenTerminal}>{'Click here to open the Terminal application'}</a>{' and run the command below:'}
        </p>
        <p className="lead">{'For Conda users:'}</p>
        <div className="row"><DocCode text={'$ conda install jupyter'} /></div>
        <p className="lead">{'For pip users:'}</p>
        <div className="row"><DocCode text={'$ pip install jupyter'} /></div>
        <button className="btn btn-default"
          onClick={this.props.onOpenDocs}
        >{'Help'}</button>
        &nbsp;
        <button className="btn btn-info"
          onClick={this.handleChangePath}
        >{'Change Path'}</button>
        &nbsp;
        <button className="btn btn-primary"
          onClick={this.handleTestPythonPath}
        >{'Retry'}</button>
      </div>
    );
  }
});