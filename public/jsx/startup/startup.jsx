/* globals ipc */
'use strict';

var Startup = window.Startup = React.createClass({
  getInitialState: function () {
    return {
      status: 'loading',
      statusPython: false,
      statusJupyter: false,
      pythonPath: null
    };
  },
  componentDidMount: function () {
    var self = this;

    ipc.send('get_system_facts').then(function (result) {
      console.log('system_facts', result);
    }).catch(function (error) {
      console.error(error);
      self.setState({
        status: 'error',
        message: error.message
      });
    });

    console.log('startup', 'componentDidMount', this);
    ipc.on('setup-status', function (evt, data) {
      console.log('startup', 'setup-status', evt, data);
      var s = self.state;

      s.statusPython = data.python;
      s.statusJupyter = data.jupyter;
      if (data.python == false || data.jupyter == false) {
        s.status = 'error';
      } else if (data.isFirstRun == true) {
        s.status = 'good to go';
        setTimeout(function () {
          self.setState({
            status: 'tour',
            statusPython: self.state.statusPython,
            statusJupyter: self.state.statusJupyter,
            pythonPath: self.state.pythonPath
          });
        }, 1500);
      } else {
        s.status = 'good to go';
      }
      self.setState(s);
      if (data.python == true && data.jupyter == true && data.isFirstRun == false) {
        // ain't our first Rodeo
        //ipc.send('exit-tour');
      }
    });
  },
  testPythonPath: function (pythonPath) {
    var s = this.state;
    s.pythonPath = pythonPath || s.pythonPath || "NOTHING";
    s.status = 'loading';
    this.setState(s);

    var self = this;
    setTimeout(function () {
      var result = ipc.send('test-path', pythonPath || "NOTHING");
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
          status: "error",
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
      <div className="jumbotron"
        style={style}
      >
        {content}
      </div>
    );
  }
});
