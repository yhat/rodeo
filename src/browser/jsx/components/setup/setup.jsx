import _ from 'lodash';
import React from 'react';
import SetupInitial from './setup-initial.jsx';
import SetupInstallAnaconda from './setup-install-anaconda.jsx';
import SetupInstallJupyter from './setup-install-jupyter.jsx';
import SetupInstallNumpy from './setup-install-numpy.jsx';
import SetupInstallScipy from './setup-install-scipy.jsx';
import SetupInstallPandas from './setup-install-pandas.jsx';
import SetupInstallMatplotlib from './setup-install-matplotlib.jsx';
import SetupManualCommand from './setup-manual-command.jsx';
import SetupNoJupyter from './setup-no-jupyter.jsx';
import SetupNoPython from './setup-no-python.jsx';
import SetupNoScipy from './setup-no-scipy.jsx';
import SetupNoNumpy from './setup-no-numpy.jsx';
import SetupNoPandas from './setup-no-pandas.jsx';
import SetupNoMatplotlib from './setup-no-matplotlib.jsx';
import SetupPythonError from './setup-python-error.jsx';
import SetupReady from './setup-ready.jsx';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import './setup.css';
import commonReact from '../../services/common-react';

/**
 * @class Setup
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'Setup',
  propTypes: {
    contentType: React.PropTypes.string.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      types = {
        initial: () => <SetupInitial className={className} key="initial" {...props}/>,
        installAnaconda: () => <SetupInstallAnaconda className={className} key="installAnaconda" {...props}/>,
        installJupyter: () => <SetupInstallJupyter className={className} key="installJupyter" {...props}/>,
        installScipy: () => <SetupInstallScipy className={className} key="installScipy" {...props}/>,
        installNumpy: () => <SetupInstallNumpy className={className} key="installNumpy" {...props}/>,
        installPandas: () => <SetupInstallPandas className={className} key="installPandas" {...props}/>,
        installMatplotlib: () => <SetupInstallMatplotlib className={className} key="installMatplotlib" {...props}/>,
        manualCommand: () => <SetupManualCommand className={className} key="manualCommand" {...props}/>,
        noJupyter: () => <SetupNoJupyter className={className} key="noJupyter" {...props}/>,
        noPython: () => <SetupNoPython className={className} key="noPython" {...props}/>,
        noScipy: () => <SetupNoScipy className={className} key="noScipy" {...props}/>,
        noNumpy: () => <SetupNoNumpy className={className} key="noNumpy" {...props}/>,
        noPandas: () => <SetupNoPandas className={className} key="noPandas" {...props}/>,
        noMatplotlib: () => <SetupNoMatplotlib className={className} key="noMatplotlib" {...props}/>,
        pythonError: () => <SetupPythonError className={className} key="pythonError" {...props}/>,
        ready: () => <SetupReady className={className} key="ready" {...props}/>
      };

    return (
      <CSSTransitionGroup
        transitionAppear={true}
        transitionAppearTimeout={200}
        transitionEnterTimeout={200}
        transitionLeaveTimeout={200}
        transitionName="setup"
      >
        {types[props.contentType] ? types[props.contentType]() : null}
      </CSSTransitionGroup>
    );
  }
});
