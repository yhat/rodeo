import React from 'react';
import SetupReady from '../components/setup/setup-ready.jsx';
import LoadingWidget from '../components/loading-widget.jsx';
import SetupPython from '../components/setup/setup-python.jsx';
import Tour from '../components/tour/tour.jsx';
import tourData from '../components/tour/tour-data';
import * as store from '../services/store';
import { send } from '../services/ipc';
import './startup.less';

/**
 * @typedef {object} SystemFacts
 * @property {object} pythonOptions
 * @property {string} pythonOptions.cmd
 * @property {string} [pythonOptions.shell]
 * @property {Array} availablePythonKernels
 */

/**
 * @param {Startup} component
 * @param {SystemFacts} facts
 */
function setSystemFacts(component, facts) {
  store.set('systemFacts', facts);
  component.setState({systemFacts: facts});
}

/**
 * @param {Startup} component
 */
function chooseFirstKernel(component) {
  const facts = component.state.systemFacts,
    availablePythonKernels = facts && facts.availablePythonKernels,
    first = availablePythonKernels && availablePythonKernels[0],
    pythonOptions = first && first.pythonOptions;

  if (pythonOptions) {
    // just chose the first one, they can tell us we were wrong later
    store.set('pythonOptions', pythonOptions);
    component.setState({pythonOptions});
  }
}

export default React.createClass({
  displayName: 'Startup',
  getInitialState: function () {
    return {
      seenTour: store.get('seenTour'),
      pythonOptions: store.get('pythonOptions'),
      systemFacts: store.get('systemFacts')
    };
  },
  componentDidMount: function () {
    const state = this.state;

    if (!state.pythonOptions) {
      if (!state.systemFacts) {
        send('get_system_facts')
          .then((facts) => setSystemFacts(this, facts))
          .then(() => chooseFirstKernel(this))
          .catch(this.showError);
      } else {
        chooseFirstKernel(this);
      }
    }
  },
  /**
   * @param {Error} error
   */
  showError: function (error) {
    // todo: show something to user
    console.error(error);
  },
  close: () => send('close_window', 'startupWindow'),
  handleInstallPython: () => send('install_python'),
  handleSelectPythonDialog: function () {
    return send('open_dialog', {
      title: 'Select your Python',
      properties: ['openFile']
    }).then(function (result) {
      if (result.length && result.length > 0) {
        result = result[0];
      }

      return result;
    });
  },
  /**
   * @param {string} pythonCommand
   */
  handleSetPython: function (pythonCommand) {
    const pythonOptions = {cmd: pythonCommand};

    console.log('setting state', pythonOptions);

    this.setState({pythonOptions});
    store.set('pythonOptions', pythonOptions);
  },
  handleExitTour: function () {
    store.set('seenTour', true);
    this.close();
  },
  handleReady: function () {
    this.close();
  },
  render: function () {
    const state = this.state;
    let content;

    if (!state.pythonOptions) {
      if (!state.systemFacts) {
        // we're getting the system facts
        content = <LoadingWidget />;
      } else {
        // no python in systemFacts, so ask them for it
        content = (
          <SetupPython
            onInstallPython={this.handleInstallPython}
            onSelect={this.handleSetPython}
            onSelectPythonDialog={this.handleSelectPythonDialog}
          />
        );
      }
    } else if (!state.seenTour) {
      content = (
        <Tour onExitTour={this.handleExitTour}
          tourData={tourData}
        />
      );
    }

    if (!content) {
      content = <SetupReady onReady={this.handleReady}/>;
    }

    return content;
  }
});
