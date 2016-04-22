/* globals ipc */
'use strict';

var Startup = window.Startup = React.createClass({
  getInitialState: function () {
    return {
      status: 'loading',
      statusPython: false,
      statusJupyter: false,
      pythonPath: ''
    };
  },
  componentDidMount: function () {
    const self = this;

    ipc.send('get_system_facts').then(function (result) {
      console.log('system_facts', result);

      // reducer
      self.setState({
        status: result.preferences ? 'tour' : 'good to go',
        statusPython: result.pythonStarts === true,
        statusJupyter: result.python.hasJupyterKernel === true,
        pythonPath: result.pythonPath
      });
    }).catch(function (error) {
      console.error(error);

      self.setState({
        status: 'error'
      });
    });
  },
  testPythonPath: function (pythonPath) {
    // they entered a new python path to try and fix a bad one; test to see if it is okay.

    var s = this.state;
    s.pythonPath = pythonPath || s.pythonPath || 'NOTHING';
    s.status = 'loading';
    this.setState(s);

    var self = this;
    setTimeout(function () {
      var result = ipc.send('test-path', pythonPath || 'NOTHING');
      var status;
      if (result && result.python && result.jupyter) {
        status = 'good to go';
        ipc.send('launch-kernel', pythonPath);
        self.setState({
          status: 'tour',
          statusPython: self.state.statusPython,
          statusJupyter: self.state.statusJupyter,
          pythonPath: self.state.pythonPath
        });
      } else {
        self.setState({
          status: 'error',
          statusPython: result.python,
          statusJupyter: result.jupyter,
          pythonPath: pythonPath
        });
      }
    }, 750);
  },
  render: function () {
    var style = {backgroundColor: 'inherit'},
      content;

    if (this.state.status == 'loading') {
      content = <LoadingWidget />;
    } else if (this.state.status == 'error') {
      content = (
        <div>
          <SetupTriage pythonPath={this.state.pythonPath}
            statusJupyter={this.state.statusJupyter}
            statusPython={this.state.statusPython}
            testPythonPath={this.testPythonPath}
          />
        </div>
      );
    } else if (this.state.status == 'good to go') {
      content = (
        <div>
          <p className="lead text-center">You're ready to Rodeo!</p>
          <SetupTriage pythonPath={this.state.pythonPath}
            statusJupyter={this.state.statusJupyter}
            statusPython={this.state.statusPython}
            testPythonPath={this.testPythonPath}
          />
        </div>
      );
    } else {
      content = (
        <Tour />
      );
    }

    return (
      <div
        className="jumbotron"
        style={style}
      >
        {content}
      </div>
    );
  }
});
