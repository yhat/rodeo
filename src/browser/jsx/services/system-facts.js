import _ from 'lodash';
import store from './store';
import clientDiscovery from './client-discovery';

/**
 * Get the first set of working kernel options that was detected when gathering system facts
 * (by the by, also refreshes the known system facts.)
 * @returns {Promise<object>}
 */
function getFreshPythonOptions() {
  return clientDiscovery.getSystemFacts().then(function (facts) {
    const availablePythonKernels = facts && facts.availablePythonKernels,
      head = _.head(availablePythonKernels),
      pythonOptions = head && head.pythonOptions;

    store.set('systemFacts', facts);
    return clientDiscovery.checkKernel(pythonOptions)
      .then(() => pythonOptions);
  });
}

export default {
  getFreshPythonOptions
};
