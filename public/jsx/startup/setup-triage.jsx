/* globals ipc, React, SetupJupyter, SetupPython, ReportChecklist */
'use strict';

const SetupTriage = window.SetupTriage = React.createClass({
  propTypes: {
    onNewPythonPath: React.PropTypes.func.isRequired,
    pythonPath: React.PropTypes.string.isRequired,
    statusJupyter: React.PropTypes.bool.isRequired,
    statusPython: React.PropTypes.bool.isRequired
  },
  handleOpenDocs: () => ipc.send('open_external', 'http://rodeo.yhat.com/docs/'),
  handleOpenTerminal: () => ipc.send('open_terminal'),
  render: function () {
    let ready, python, jupyter;

    if (this.props.statusPython && this.props.statusJupyter) {
      ready = <p className="lead text-center">{'You\'re ready to Rodeo!'}</p>;
    }

    if (this.props.statusPython == false) {
      python = (
        <SetupPython
          onNewPythonPath={this.props.onNewPythonPath}
          onOpenDocs={this.handleOpenDocs}
        />
      );
    } else if (this.props.statusJupyter == false) {
      jupyter = (
        <SetupJupyter
          onNewPythonPath={this.props.onNewPythonPath}
          onOpenDocs={this.handleOpenDocs}
          pythonPath={this.props.pythonPath}
        />
      );
    }

    return (
      <div className="row text-center"
        id="setup-triage"
      >
        {ready}
        <div className="row">
          <ReportChecklist list={[
            {ok: this.props.statusPython, label: 'Python PATH'},
            {ok: this.props.statusJupyter, label: 'Jupyter'}
          ]}
          />
        </div>
        <br />
        {python}
        {jupyter}
      </div>
    );
  }
});