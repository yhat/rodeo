import _ from 'lodash';
import {send} from 'ipc';
import clientDiscovery from '../../services/client-discovery';

function finish() {
  return function () {
    return send('finishStartup')
      .catch(error => console.error(error));
  };
}

function execute() {
  return function (dispatch, getState) {
    const state = getState(),
      cmd = _.get(state, 'setup.terminal.cmd'),
      code = [
        'print("Welcome to Rodeo!")'
      ].join('\n');

    dispatch({type: 'SETUP_EXECUTING', cmd, code});
    return clientDiscovery.executeWithNewKernel({cmd}, code)
      .then(result => dispatch({type: 'SETUP_EXECUTED', result}))
      .catch(error => console.error(error));
  };
}

function transition(contentType) {
  return {type: 'SETUP_TRANSITION', contentType};
}

function changeInput(key, event) {
  const value = _.isString(event) ? event : event.target.value;

  return {type: 'SETUP_CHANGE', key, value};
}

function installPackage() {
  return function (dispatch, getState) {
    const state = getState(),
      cmd = _.get(state, 'setup.terminal.cmd'),
      code = [
        'import pip',
        'pip.main(["install", "-vvvv", "jupyter"])'
      ].join('\n'),
      args = ['-u', '-c', code];

    dispatch({type: 'SETUP_PACKAGE_INSTALLING', cmd, args});
    return send('executeProcess', cmd, ['-u', '-c', code])
      .then(result => dispatch({type: 'SETUP_PACKAGE_INSTALLED', result}))
      .catch(error => console.error(error));
  };
}

export default {
  execute,
  finish,
  transition,
  changeInput,
  installPackage
};
