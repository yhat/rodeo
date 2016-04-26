/* globals React, DocCode */
'use strict';

const SetupPython = window.SetupPython = React.createClass({
  propTypes: {
    onNewPythonPath: React.PropTypes.func.isRequired,
    onOpenTerminal: React.PropTypes.func.isRequired
  },
  getInitialState: function () {
    return { pythonPath: '' };
  },
  pickPythonPath: function () {
    let self = this;

    require('remote').dialog.showOpenDialog({
      title: 'Select your Python',
      properties: [ 'openFile' ]
    }, function (pythonPath) {
      $('#pathval').val(pythonPath[0]);
      self.setState({ pythonPath: pythonPath[0] });
    });
  },
  setPythonPath: function () {
    this.props.onNewPythonPath(this.state.pythonPath);
  },
  updatePath: function () {
    let pythonPath = $('#pathval').val();

    this.setState({ pythonPath: pythonPath });
  },
  render: function () {
    let examplePaths = 'i.e. /usr/bin/python, /Users/alf/anaconda/envs/py27/bin/python, /usr/local/bin/python',
      whichPython = 'which python';

    if (/win32/.test(process.platform)) {
      whichPython = 'for %i in (python.exe) do @echo. %~$PATH:i';
      examplePaths = 'i.e. C:\\Program Files\\Python 3.5\\python.exe, C:\\Users\\alf\\Anaconda\\envs\\py27\\python.exe';
    }

    return (
      <div className="row possible-error">
        <h2>{'Looks like we\'re having trouble finding your python path'}</h2>
        <p className="lead">{'If you know your python path, paste it in the field below:'}</p>
        <div className="row">
          <div className="form-group col-sm-10 col-sm-offset-1">
            <div className="input-group">
              <input className="form-control"
                id="pathval"
                onChange={this.updatePath}
                placeholder={examplePaths}
                readOnly={false}
                type="text"
              />
              <div className="input-group-btn">
                <button className="btn btn-primary"
                  onClick={this.setPythonPath}
                >{'Set Path'}</button>
              </div>
            </div>
          </div>
        </div>
        <div className="row"
          id="which-python"
        >
          <h2>{'Don\'t know where your python path is?'}</h2>
          <p className="lead">
            <a onClick={this.props.onOpenTerminal}>{'Click here to open the Terminal application'}</a>{' and run the command below:'}
          </p>
          <div className="row"><DocCode text={whichPython} /></div>
        </div>
      </div>
    );
  }
});