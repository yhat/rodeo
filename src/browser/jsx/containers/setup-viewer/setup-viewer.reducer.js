import _ from 'lodash';
import mapReducers from '../../services/map-reducers';
import {local} from '../../services/store';

const initialState = {
  contentType: 'initial',
  secondaryTerminal: {
    state: 'initial',
    prompt: '$',
    cmd: '_',
    errors: [],
    stdout: '',
    stderr: '',
    code: 0
  },
  terminal: {
    state: 'initial',
    prompt: '$',
    cmd: local.get('pythonCmd') || 'python',
    errors: [],
    stdout: '',
    stderr: '',
    code: 0
  }
};

/**
 * @param {Error} error
 * @param {string} code
 * @returns {boolean}
 */
function isErrorCode(error, code) {
  return error.code === code || _.includes(error.message, code);
}

function executing(state) {
  state = _.clone(state);
  const newTerminal = {
    state: 'executing',
    events: [],
    errors: [],
    stderr: '',
    stdout: '',
    code: 0
  };

  state.terminal = _.assign({}, state.terminal, newTerminal);

  return state;
}

function executed(state, action) {
  state = _.clone(state);
  state.terminal = _.assign({}, state.terminal, action.result);
  return state;
}

function transition(state, action) {
  state = _.clone(state);

  if (action.contentType === 'manualCommand') {
    state.terminal = _.assign({}, state.terminal, {
      state: '',
      errors: [],
      events: [],
      stdout: '',
      stderr: '',
      code: 0
    });
  }

  state.contentType = action.contentType;
  return state;
}

function change(state, action) {
  state = _.clone(state);
  state.terminal = _.clone(state.terminal);
  _.set(state, action.key, action.value);
  return state;
}

function packageInstalling(state, action) {
  state = _.clone(state);
  const newTerminal = {
    cmd: [action.cmd, action.args.join(' ')].join(' '),
    state: 'executing',
    events: [],
    errors: [],
    stderr: '',
    stdout: ''
  };

  state.secondaryTerminal = _.assign({}, state.secondaryTerminal, newTerminal);

  return state;
}

function packageInstalled(state, action) {
  state = _.clone(state);
  const newTerminal = action.result;

  newTerminal.state = 'executed';

  if (newTerminal.errors.length) {
    newTerminal.errors = newTerminal.errors.map(function (error) {
      let icon = 'fa-asterisk',
        message;

      if (isErrorCode(error, 'ENOENT')) {
        // bell // exclamation // flask
        message = 'No such file or command';
      } else if (isErrorCode(error, 'EACCES')) {
        message = 'Permission denied';
      } else {
        console.error(error);
        message = error.message;
      }

      return {icon, message};
    });
  }

  state.secondaryTerminal = _.assign({}, state.secondaryTerminal, newTerminal);

  return state;
}

function readyToShow(state, action) {
  state = _.clone(state);
  const name = action.name;

  if (name === 'mainWindow') {
    state.isMainWindowReady = true;
  }

  return state;
}

export default mapReducers({
  SETUP_EXECUTED: executed,
  SETUP_EXECUTING: executing,
  SETUP_PACKAGE_INSTALLED: packageInstalled,
  SETUP_PACKAGE_INSTALLING: packageInstalling,
  SETUP_TRANSITION: transition,
  SETUP_CHANGE: change,
  READY_TO_SHOW: readyToShow
}, initialState);
