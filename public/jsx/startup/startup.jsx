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

      console.log('hey');

      const seenTour = window.localStorage.getItem('seenTour');
      let state;

      // reducer
      state = {
        status: !seenTour ? 'tour' : 'good to go',
        statusPython: result.pythonStarts === true,
        statusJupyter: result.python.hasJupyterKernel === true,
        pythonPath: result.pythonPath
      };

      console.log('hey');
      console.log('state', state);
      self.setState(state);

    }).catch(function (error) {
      let state;
      console.error(error);

      state = {
        status: 'error'
      };
      console.log('state', state);
      self.setState(state);
    });
  },
  testPythonPath: function (pythonPath) {
    // they entered a new python path to try and fix a bad one; test to see if it is okay.

    let state = this.state,
      self = this;

    state.pythonPath = pythonPath || state.pythonPath || 'NOTHING';
    state.status = 'loading';
    this.setState(state);

    setTimeout(function () {
      let state,
        result = ipc.send('test-path', pythonPath || 'NOTHING');

      if (result && result.python && result.jupyter) {

        state = {
          status: 'tour',
          statusPython: self.state.statusPython,
          statusJupyter: self.state.statusJupyter,
          pythonPath: self.state.pythonPath
        };
        console.log('state', state);
        self.setState(state);
      } else {
        state = {
          status: 'error',
          statusPython: result.python,
          statusJupyter: result.jupyter,
          pythonPath: pythonPath
        };
        console.log('state', state);
        self.setState(state);
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
          <p className="lead text-center">{'You\'re ready to Rodeo!'}</p>
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
