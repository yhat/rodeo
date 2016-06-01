import _ from 'lodash';
import store from './store';
import clientDiscovery from './client-discovery';
import guid from './guid';

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

function getSystemFacts() {
  let systemFacts = store.get('systemFacts');

  if (!systemFacts || !systemFacts.appVersion) {
    return clientDiscovery.getSystemFacts().then(function (facts) {
      store.set('systemFacts', facts);
      return facts;
    });
  }

  return Promise.resolve(systemFacts);
}

function getUserId() {
  let userId = store.get('userId');

  if (!userId) {
    userId = guid();
    store.set('userId', userId);
  }

  return userId;
}

export default {
  getSystemFacts,
  getFreshPythonOptions,
  getUserId
};
