var SetupTriage = window.SetupTriage = React.createClass({
  render: function() {
    var python;
    if (this.props.statusPython==false) {
      python = <SetupPython testPythonPath={this.props.testPythonPath} />;
    }
    var jupyter;
    if (this.props.statusPython==true && this.props.statusJupyter==false) {
      jupyter = <SetupJupyter pythonPath={this.props.pythonPath} testPythonPath={this.props.testPythonPath} />;
    }
    return (
      <div id="setup-triage" className="row text-center">
        <div className="row">
          <div className="col-sm-4 col-sm-offset-4">
            <li className={this.props.statusPython ? "list-group-item list-group-item-success": "list-group-item list-group-item-danger"}>
              Python PATH&nbsp;<i className={this.props.statusPython ? "fa fa-check": "fa fa-times"}></i>
            </li>
            <li className={this.props.statusJupyter ? "list-group-item list-group-item-success": "list-group-item list-group-item-danger"}>
              Jupyter&nbsp;<i className={this.props.statusJupyter ? "fa fa-check": "fa fa-times"}></i>
            </li>
          </div>
        </div>
        <br />
        {python}
        {jupyter}
      </div>
    );
  }
});