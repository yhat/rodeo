/* globals React */
'use strict';

const SetupPython = window.SetupPython = (function () {

  /**
   * @param {string} platform
   * @returns {string}
   */
  function getExamplePaths(platform) {
    let result;

    if (platform === 'win32') {
      result = 'i.e. C:\\Program Files\\Python 3.5\\python.exe, C:\\Users\\alf\\Anaconda\\envs\\py27\\python.exe';
    } else if (platform === 'linux' || platform === 'darwin') {
      result = 'i.e. /usr/bin/python, /Users/alf/anaconda/envs/py27/bin/python, /usr/local/bin/python';
    } else {
      result = 'python path';
    }

    return result;
  }

  return React.createClass({
    displayName: 'SetupPython',
    propTypes: {
      onInstallPython: React.PropTypes.func.isRequired,
      onSelect: React.PropTypes.func.isRequired,
      onSelectPythonDialog: React.PropTypes.func.isRequired,
      platform: React.PropTypes.oneOf(['win32', 'linux', 'darwin'])
    },
    getInitialState: function () {
      return {pythonPath: ''};
    },
    handleChange: function (event) {
      const target = event.currentTarget || event.target;

      this.setState({pythonPath: target.value});
    },
    handleSelectFromDialog: function () {
      this.props.onSelectPythonDialog()
        .then((pythonPath) => this.setState({pythonPath}))
        .catch(console.error);
    },
    handleSelect: function () {
      this.props.onSelect(this.state.pythonPath);
    },
    render: function () {
      const pythonPath = this.state.pythonPath,
        examplePaths = getExamplePaths(this.props.platform);

      return (
        <div className="setup-python container">
          <div className="row possible-error">
            <h2>{'Looks like we\'re having trouble finding your python.'}</h2>
            <p className="lead">{'If you know your python path or command, paste it in the field below:'}</p>
          </div>
          <div className="row">
            <div className="form-group col-sm-10 col-offset-1">
              <div className="input-group">
                <input className="form-control"
                  onChange={this.handleChange}
                  placeholder={examplePaths}
                  type="text"
                  value={pythonPath}
                />
                <div className="input-group-btn">
                  <button className="btn"
                    onClick={this.handleSelectFromDialog}
                  >{'...'}</button>
                  <button className="btn btn-primary"
                    disabled={!pythonPath}
                    onClick={this.handleSelect}
                  >{'OK'}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <h2>{'Python not installed?'}</h2>
            <p className="lead">
              <a onClick={this.props.onInstallPython}>{'Click here to install python'}</a>
            </p>
          </div>
        </div>
      );
    }
  });
}());