var SetupJupyter = window.SetupJupyter = React.createClass({
  openTerminal: function() {
    // if windows
    if (/win32/.test(process.platform)) {
      require('shell').openItem('cmd.exe');
    } else {
      require('shell').openItem('/Applications/Utilities/Terminal.app');
    }
  },
  openDocs: function() {
    require('shell').openExternal('http://rodeo.yhat.com/docs/');
  },
  testPythonPath: function() {
    this.props.testPythonPath(this.props.pythonPath);
  },
  changePath: function() {
    this.props.testPythonPath("NEW PATH");
  },
  render: function() {
    return (
      <div className="row">
        <h2>Looks like you're missing <i>jupyter</i></h2>
        <p className="lead">
          <a onClick={this.openTerminal}>Click here to open the Terminal application</a> and run the command below:
        </p>
        <p className="lead">For Conda users:</p>
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2 text-left">
            <pre>$ conda install jupyter</pre>
          </div>
        </div>
        <p className="lead">For pip users:</p>
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2 text-left">
            <pre>$ pip install jupyter</pre>
          </div>
        </div>
        <button className="btn btn-default" onClick={this.openDocs}>Help</button>
        &nbsp;
        <button className="btn btn-info" onClick={this.changePath}>Change Path</button>
        &nbsp;
        <button onClick={this.testPythonPath} className="btn btn-primary">Retry</button>
      </div>
    )
  }
});