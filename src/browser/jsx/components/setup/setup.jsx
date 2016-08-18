import _ from 'lodash';
import React from 'react';
import SetupInitial from './setup-initial.jsx';
import SetupInstallAnaconda from './setup-install-anaconda.jsx';
import SetupInstallJupyter from './setup-install-jupyter.jsx';
import SetupManualCommand from './setup-manual-command.jsx';
import SetupNoJupyter from './setup-no-jupyter.jsx';
import SetupNoPython from './setup-no-python.jsx';
import SetupPythonError from './setup-python-error.jsx';
import SetupReady from './setup-ready.jsx';
import './setup.css';

/**
 * @class Setup
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'Setup',
  propTypes: {
    contentType: React.PropTypes.string.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = _.kebabCase(displayName),
      types = {
        initial: () => <SetupInitial className={className} {...props}/>,
        installAnaconda: () => <SetupInstallAnaconda className={className} {...props}/>,
        installJupyter: () => <SetupInstallJupyter className={className} {...props}/>,
        manualCommand: () => <SetupManualCommand className={className} {...props}/>,
        noJupyter: () => <SetupNoJupyter className={className} {...props}/>,
        noPython: () => <SetupNoPython className={className} {...props}/>,
        pythonError: () => <SetupPythonError className={className} {...props}/>,
        ready: () => <SetupReady className={className} {...props}/>
      };

    return types[props.contentType] ? types[props.contentType]() : null;
  }
});
