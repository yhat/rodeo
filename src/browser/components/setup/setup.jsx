import React from 'react';
import SetupInitial from './setup-initial.jsx';
import SetupInstallAnaconda from './setup-install-anaconda.jsx';
import SetupInstallPackage from './setup-install-package.jsx';
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
import commonReact from '../../services/common-react';
import './setup.css';

export default React.createClass({
  displayName: 'Setup',
  propTypes: {
    contentType: React.PropTypes.string.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      text = this.context.text,
      types = {
        initial: () => (
          <SetupInitial
            className={className}
            key="initial"
            {...props}
          />
        ),
        installAnaconda: () => <SetupInstallAnaconda className={className} key="installAnaconda" {...props}/>,
        installJupyter: () => (
          <SetupInstallPackage
            {...props}
            className={className}
            explanationLabel={text.explainJupyter}
            key="installJupyter"
            packageName="jupyter"
            terminal={props.secondaryTerminal}
          />
        ),
        installScipy: () => (
          <SetupInstallPackage
            {...props}
            className={className}
            explanationLabel={text.explainScipy}
            key="installScipy"
            packageName="scipy"
            terminal={props.secondaryTerminal}
          />
        ),
        installNumpy: () => (
          <SetupInstallPackage
            {...props}
            className={className}
            explanationLabel={text.explainNumpy}
            key="installNumpy"
            packageName="numpy"
            terminal={props.secondaryTerminal}
          />
        ),
        installPandas: () => (
          <SetupInstallPackage
            {...props}
            className={className}
            explanationLabel={text.explainPandas}
            key="installPandas"
            packageName="pandas"
            terminal={props.secondaryTerminal}
          />
        ),
        installMatplotlib: () => (
          <SetupInstallPackage
            {...props}
            className={className}
            explanationLabel={text.explainMatplotlib}
            key="installMatplotlib"
            packageName="matplotlib"
            terminal={props.secondaryTerminal}
          />
        ),
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
