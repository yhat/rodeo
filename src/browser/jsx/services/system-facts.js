import _ from 'lodash';
import {send} from './ipc';
import store from './store';

/**
 * Get the first set of working kernel options that was detected when gathering system facts
 * (by the by, also refreshes the known system facts.)
 * @returns {Promise<object>}
 */
function getFreshPythonOptions() {
  return send('getSystemFacts').then(function (facts) {
    const availablePythonKernels = facts && facts.availablePythonKernels,
      head = _.head(availablePythonKernels),
      pythonOptions = head && head.pythonOptions;

    store.set('systemFacts', facts);
    return send('checkKernel', pythonOptions)
      .then(() => pythonOptions);
  });
}

export default {
  getFreshPythonOptions
};
