import React from 'react';
import './python-selector.less';

export default React.createClass({
  displayName: 'PythonSelectorItem',
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    pythonDefinition: React.PropTypes.object.isRequired,
    showDescription: React.PropTypes.bool,
    showVersion: React.PropTypes.bool
  },
  render: function () {
    const pythonDefinition = this.props.pythonDefinition,
      packagesToFind = ['pandas', 'numpy', 'pytables', 'matplotlib'],
      pythonOptions = pythonDefinition.pythonOptions,
      checkResults = pythonDefinition.checkResults,
      packagesOfNote = checkResults && checkResults.packages &&
        checkResults.packages.filter(item => packagesToFind.indexOf(item.name) > -1),
      label = pythonOptions.label || pythonOptions.cmd;
    let packagesOnDisplay, jupyterWarning, logo, version, description;

    if (packagesOfNote.length) {
      packagesOnDisplay = packagesOfNote.map(function (item) {
        const logoClass = 'logo-' + item.name,
          title = item.name + ' ' + item.version;

        return (
          <div className={logoClass}
            title={title}
          ></div>
        );
      });
    } else {
      packagesOnDisplay = <div className="packages-missing-warning"></div>;
    }

    if (/Anaconda/.test(checkResults.version)) {
      logo = 'logo-anaconda';
    } else {
      logo = 'logo-python';
    }

    if (!checkResults.hasJupyterKernel) {
      jupyterWarning = <div className="jupyter-missing-warning">{'Jupyter was not found'}</div>;
    }

    if (this.props.showVersion !== false) {
      version = <div className="version code-value">{checkResults.version}</div>;
    }

    if (this.props.showDescription !== false) {
      description = (
        <div className="description">
          <div className="cmd code-value">{label}</div>
          {version}
          {jupyterWarning}
        </div>
      );
    }

    return (
      <section className="python-selector-item">
        <header className={logo}
          title={checkResults.version}
        />
        {description}
        <div className="packages-on-display">{packagesOnDisplay}</div>
        <footer>
          <button className="btn btn-default"
            onClick={this.props.onClick}
          >{'Select'}</button>
        </footer>
      </section>
    );
  }
});
