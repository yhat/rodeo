import kernelActions from '../../actions/kernel';
import applicationActions from '../../actions/application';
import systemFacts from '../../services/system-facts';
import {send} from '../../services/ipc';

function closeWindow() {
  return function (dispatch) {
    dispatch({type: 'CLOSING_WINDOW'});
    send('closeWindow', 'startupWindow')
      .then(() => dispatch({type: 'CLOSED_WINDOW'}))
      .catch(error => console.error(error));
  };
}

function ask(question) {
  return {type: 'SETUP_QUESTION', question};
}

function setCmd(cmd) {
  return function (dispatch) {
    return send('checkKernel', {cmd})
      .then(pythonOptions => dispatch(kernelActions.kernelDetected(pythonOptions)))
      .catch(error => console.error(error));
  };
}

function test(cmd) {
  return function (dispatch) {
    dispatch({type: 'TESTING_PYTHON_CMD', cmd});
    return send('checkKernel', {cmd})
      .then(() => dispatch({type: 'TESTED_PYTHON_CMD', cmd}))
      .catch(error => dispatch({type: 'TESTED_PYTHON_CMD', cmd, error}));
  };
}

function saveTest(cmd) {
  return function (dispatch) {
    return send('checkKernel', {cmd})
      .then(pythonOptions => dispatch(kernelActions.kernelDetected(pythonOptions)))
      .then(() => dispatch({type: 'SAVED_PYTHON_TEST'}))
      .catch(error => console.error(error));
  };
}

function testInstall() {
  return function (dispatch) {
    return systemFacts.getFreshPythonOptions()
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
