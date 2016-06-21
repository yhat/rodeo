import kernelActions from '../../actions/kernel';
import {send} from 'ipc';
import clientDiscovery from '../../services/client-discovery';
import {errorCaught} from '../../actions/application';
import track from '../../services/track';

function closeWindow() {
  return function (dispatch) {
    dispatch({type: 'CLOSING_WINDOW'});
    send('closeWindow', 'startupWindow')
      .then(() => dispatch({type: 'CLOSED_WINDOW'}))
      .catch(error => console.error(error));
  };
}

function ask(question) {
  track('setup-viewer', 'ask', question);
  return {type: 'SETUP_QUESTION', question};
}

function setCmd(cmd) {
  return function (dispatch) {
    return clientDiscovery.checkKernel({cmd})
      .then(pythonOptions => dispatch(kernelActions.kernelDetected(pythonOptions)))
      .catch(error => dispatch(errorCaught(error)));
  };
}

function test(cmd) {
  return function (dispatch) {
    dispatch({type: 'TESTING_PYTHON_CMD', cmd});
    return clientDiscovery.checkKernel({cmd})
      .then(() => dispatch({type: 'TESTED_PYTHON_CMD', cmd}))
      .catch(error => dispatch({type: 'TESTED_PYTHON_CMD', cmd, error}));
  };
}

function saveTest(cmd) {
  track('setup-viewer', 'saveTest');
  return function (dispatch) {
    return clientDiscovery.checkKernel({cmd})
      .then(pythonOptions => dispatch(kernelActions.kernelDetected(pythonOptions)))
      .then(() => dispatch({type: 'SAVED_PYTHON_TEST'}))
      .catch(error => dispatch(errorCaught(error)));
  };
}

function testInstall() {
  return function (dispatch) {
    return clientDiscovery.getFreshPythonOptions()
      .then(pythonOptions => dispatch(kernelActions.kernelDetected(pythonOptions)))
      .then(() => dispatch({type: 'INSTALLED_PYTHON'}))
      .catch(() => dispatch({type: 'INSTALLED_PYTHON_NOT_FOUND'}));
  };
}

export default {
  ask,
  closeWindow,
  setCmd,
  saveTest,
  test,
  testInstall
};
