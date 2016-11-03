import _ from 'lodash';
import {send} from 'ipc';
import preferenceActions from '../../actions/preferences';
import clientDiscovery from '../../services/jupyter/client-discovery';
import {local} from '../../services/store';
import track from '../../services/track';

/**
 * @param {Error} error
 * @param {string} code
 * @returns {boolean}
 */
function isErrorCode(error, code) {
  return error.code === code || _.includes(error.message, code);
}

function handleError(error) {
  console.error(error);
}

function finish() {
  return function () {
    track({category: 'setup', action: 'finish'});
    return send('finishStartup').catch(handleError);
  };
}

function saveCmd(dispatch, cmd) {
  // if the pythonCmd is new, save it and inform everyone that it has changed
  if (local.get('pythonCmd') !== cmd) {
    track({category: 'setup', action: 'saveCmd', label: cmd});
    dispatch(preferenceActions.savePreferenceChanges([{key: 'pythonCmd', value: cmd}]));
  }
}

/**
 * @param {Error} error
 * @returns {{icon: string, message: *}}
 */
function convertErrorToIconMessage(error) {
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
}

function handleExecuted(dispatch, getState) {
  return function (result) {
    const terminal = result;

    terminal.state = 'executed';

    if (terminal.errors.length) {
      terminal.errors = terminal.errors.map(convertErrorToIconMessage);
      dispatch(transition('pythonError'));
    } else if (terminal.stderr.match(/Jupyter is not installed/)) {
      terminal.stdout = 'from jupyter_client import manager';
      terminal.stderr = '';
      terminal.errors.unshift({icon: 'fa-asterisk', message: 'Jupyter is not installed'});
      dispatch(transition('noJupyter'));
    } else if (terminal.stderr.match(/Numpy is not installed/)) {
      terminal.stdout = 'import numpy';
      terminal.stderr = '';
      terminal.errors.unshift({icon: 'fa-asterisk', message: 'Numpy is not installed'});
      dispatch(transition('noNumpy'));
    } else if (terminal.stderr.match(/Scipy is not installed/)) {
      terminal.stdout = 'import scipy';
      terminal.stderr = '';
      terminal.errors.unshift({icon: 'fa-asterisk', message: 'Scipy is not installed'});
      dispatch(transition('noScipy'));
    } else if (terminal.stderr.match(/Matplotlib is not installed/)) {
      terminal.stdout = 'import matplotlib';
      terminal.stderr = '';
      terminal.errors.unshift({icon: 'fa-asterisk', message: 'Matplotlib is not installed'});
      dispatch(transition('noMatplotlib'));
    } else if (terminal.stderr.match(/Pandas is not installed/)) {
      terminal.stdout = 'import pandas';
      terminal.stderr = '';
      terminal.errors.unshift({icon: 'fa-asterisk', message: 'Pandas is not installed'});
      dispatch(transition('noPandas'));
    } else if (terminal.code === 127) {
      dispatch(transition('noPython'));
    } else if (terminal.code !== 0) {
      dispatch(transition('pythonError'));
    } else {
      const state = getState(),
        cmd = _.get(state, 'setup.terminal.cmd'),
        isMainWindowReady = _.get(state, 'setup.isMainWindowReady');

      saveCmd(dispatch, cmd);
      if (isMainWindowReady) {
        dispatch(finish());
      } else {
        dispatch(transition('ready'));
      }
    }

    dispatch({type: 'SETUP_EXECUTED', result, meta: {sender: 'self'}});
  };
}

function execute() {
  return function (dispatch, getState) {
    const state = getState(),
      cmd = _.get(state, 'setup.terminal.cmd'),
      code = [
        'print("Welcome to Rodeo!")'
      ].join('\n');

    dispatch({type: 'SETUP_EXECUTING', cmd, code, meta: {sender: 'self'}});
    return clientDiscovery.executeWithNewKernel({cmd}, code)
      .then(handleExecuted(dispatch, getState))
      .catch(handleError);
  };
}

function transition(contentType) {
  track({category: 'setup', action: 'transition/' + contentType});
  return {type: 'SETUP_TRANSITION', contentType, meta: {sender: 'self'}};
}

function changeInput(key, event) {
  const value = _.isString(event) ? event : event.target.value;

  return {type: 'SETUP_CHANGE', key, value, meta: {sender: 'self'}};
}

function handlePackageInstalled(dispatch) {
  return function (result) {
    const terminal = result;

    terminal.state = 'executed';
    terminal.errors = terminal.errors.map(convertErrorToIconMessage);

    if (terminal.errors.length) {
      terminal.errors = terminal.errors.map(convertErrorToIconMessage);

      dispatch(transition('pythonError'));
    } else if (terminal.stderr.match(/DistributionNotFound/)) {
      terminal.errors.unshift({icon: 'fa-asterisk', message: 'Are you connected to the Internet?'});

      dispatch(transition('pythonError'));
    }

    dispatch({type: 'SETUP_PACKAGE_INSTALLED', result, meta: {sender: 'self'}});
  };
}

function installPackage(targetPackage) {
  return function (dispatch, getState) {
    track({category: 'setup', action: 'installPackage', label: targetPackage});
    const state = getState(),
      cmd = _.get(state, 'setup.terminal.cmd'),
      code = [
        'import pip',
        `pip.main(["install", "-vvvv", "${targetPackage}"])`
      ].join('\n'),
      args = ['-u', '-c', code];

    dispatch({type: 'SETUP_PACKAGE_INSTALLING', cmd, args, meta: {sender: 'self'}});
    return send('executeProcess', cmd, ['-u', '-c', code])
      .then(handlePackageInstalled(dispatch))
      .catch(handleError);
  };
}

function cancel() {
  track({category: 'setup', action: 'cancel'});

  return send('quitApplication');
}

function openExternal(url) {
  track({category: 'setup', action: 'openExternal', label: url});

  return send('openExternal', url);
}

function restart() {
  track({category: 'setup', action: 'restart'});

  return send('restartApplication');
}

export default {
  cancel,
  execute,
  finish,
  transition,
  changeInput,
  installPackage,
  openExternal,
  restart
};
