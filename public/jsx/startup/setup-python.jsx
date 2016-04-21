var SetupPython = window.SetupPython = React.createClass({
  getInitialState: function () {
    return { pythonPath: '' };
  },
  pickPythonPath: function () {
    var self = this;
    require('remote').dialog.showOpenDialog({
      title: "Select your Python",
      properties: [ 'openFile' ]
    }, function(pythonPath) {
      $("#pathval").val(pythonPath[0]);
      self.setState({ pythonPath: pythonPath[0] });
    });
  },
  setPythonPath: function() {
    this.props.testPythonPath(this.state.pythonPath);
  },
  updatePath: function() {
    var pythonPath = $("#pathval").val();
    this.setState({ pythonPath: pythonPath });
  },
  openTerminal: function() {
    // if windows
    if (/win32/.test(process.platform)) {
      require('shell').openItem('cmd.exe');
    } else {
      require('shell').openItem('/Applications/Utilities/Terminal.app');
    }
  },
  render: function() {
    var examplePaths = "i.e. /usr/bin/python, /Users/alf/anaconda/envs/py27/bin/python, /usr/local/bin/python";
    var whichPython = "which python";
    if (/win32/.test(process.platform)) {
      whichPython = "for %i in (python.exe) do @echo. %~$PATH:i";
      examplePaths = "i.e. C:\\Program Files\\Python 3.5\\python.exe, C:\\Users\\alf\\Anaconda\\envs\\py27\\python.exe"
    }

    return (
      <div className="row possible-error">
        <h2>Looks like we're having trouble finding your python path</h2>
        <p className="lead">If you know your python path, paste it in the field below:</p>
        <div className="row">
          <div className="form-group col-sm-10 col-sm-offset-1">
            <div className="input-group">
              <input id="pathval" className="form-control" type="text" onChange={this.updatePath} readOnly={false} placeholder={examplePaths} />
              <div className="input-group-btn">
                <button onClick={this.setPythonPath} className="btn btn-primary">Set Path</button>
              </div>
            </div>
          </div>
        </div>
        <div id="which-python" className="row">
          <h2>Don't know where your python path is?</h2>
          <p className="lead">
            <a onClick={this.openTerminal}>Click here to open the Terminal application</a> and run the command below:
          </p>
          <div className="row">
            <div className="col-sm-8 col-sm-offset-2 text-left">
              <pre>{whichPython}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
});