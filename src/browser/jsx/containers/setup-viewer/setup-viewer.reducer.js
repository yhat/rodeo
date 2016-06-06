import _ from 'lodash';
import store from '../../services/store';
import mapReducers from '../../services/map-reducers';

const initialState = getDefault();

function getDefault() {
  const facts = store.get('systemFacts'),
    homedir = facts && facts.homedir,
    pythonValidity = store.get('pythonCmd') ? 'good' : 'bad',
    workingDirectory = store.get('workingDirectory') || homedir || '~';

  return _.assign({facts, homedir, workingDirectory, pythonValidity}, store.get('pythonOptions') || {});
}

function askForPythonOptions(state) {
  if (!state.ask) {
    state = _.clone(state);
    state.ask = 'MANUAL_OR_MISSING';
    state.warning = '';
  }

  if (state.pythonValidity !== 'ugly') {
    state = _.clone(state);
    state.pythonValidity = 'ugly';
  }

  return state;
}

/**
 *
 * @param {object} state
 * @param {object} action
 * @returns {*}
 */
function kernelDetected(state, action) {
  state = _.cloneDeep(state);

  const pythonOptions = action.pythonOptions;

  _.assign(state, action.pythonOptions);
  state.pythonValidity = pythonOptions.cmd ? 'good' : 'bad';
  delete state.ask;

  return state;
}

function askQuestion(state, action) {
  const question = action.question;

  if (question) {
    state = _.clone(state);
    state.ask = question;
    state.pythonTest = {};
    state.warning = '';
  }

  return state;
}

function testingPythonCmd(state, action) {
  state = _.clone(state);
  state.pythonTest = {
    cmd: action.cmd,
    status: 'changed'
  };

  return state;
}

function testedPythonCmd(state, action) {
  const pythonTest = state.pythonTest;

  if (pythonTest && pythonTest.cmd === action.cmd) {
    state = _.clone(state);
    state.pythonTest = {
      cmd: action.cmd,
      status: action.error ? 'invalid' : 'valid'
    };
  }

  return state;
}

function savePythonTest(state) {
  const pythonTest = state.pythonTest;

  if (pythonTest) {
    state = _.clone(state);
    state.pythonTest = {};
    delete state.ask;
  }

  return state;
}

function installedPython(state) {
  state = _.clone(state);
  state.warning = '';
  delete state.ask;

  return state;
}

function installedPythonNotFound(state) {
  state = _.clone(state);
  state.warning = 'Installed Python not found';

  return state;
}

export default mapReducers({
  KERNEL_DETECTED: kernelDetected,
  ASK_FOR_PYTHON_OPTIONS: askForPythonOptions,
  TESTING_PYTHON_CMD: testingPythonCmd,
  TESTED_PYTHON_CMD: testedPythonCmd,
  SAVED_PYTHON_TEST: savePythonTest,
  SETUP_QUESTION: askQuestion,
  INSTALLED_PYTHON: installedPython,
  INSTALLED_PYTHON_NOT_FOUND: installedPythonNotFound
}, initialState);
