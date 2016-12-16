import _ from 'lodash';
import api from '../../services/api';
import kernel from '../../actions/kernel';
import reduxUtil from '../../services/redux-util';
import commonTabsActions from '../../services/common-tabs-actions';
import client from '../../services/jupyter/client';
import {local} from '../../services/store';
import freeTabGroupActions from '../free-tab-group/free-tab-group.actions';
import {getPackageInstallCommand} from '../../services/jupyter/python-language';

const prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function clickAnnotation(groupId, id, annotation) {
  return function (dispatch) {
    // todo: focus on the plot as well
    console.log('todo: focus on plot', groupId, id, annotation);
    dispatch(freeTabGroupActions.focusFirstTabByType('plot-viewer'));
  };
}

function copyAnnotation(groupId, id) {
  return {type: prefixType + 'COPY_ANNOTATION', groupId, id};
}

function execute(groupId, id, context) {
  return function (dispatch, getState) {
    const state = getState(),
      content = commonTabsActions.getContent(state['freeTabGroups'], groupId, id),
      payload = {};

    if (!content.busy) {
      payload.input = context.text;
    }

    dispatch({type: prefixType + 'EXECUTING', groupId, id, payload});
    return dispatch(kernel.execute(context.text)).then(function (responseMsgId) {
      return dispatch({type: prefixType + 'EXECUTED', groupId, id, payload: _.assign({responseMsgId}, payload), meta: {track: true}});
    }).catch(error => dispatch({type: prefixType + 'EXECUTED', groupId, id, payload: error, error: true, meta: {track: true}}));
  };
}

function input(groupId, id, context) {
  return function (dispatch) {
    dispatch({type: prefixType + 'INPUTTING', groupId, id});
    return dispatch(kernel.input(context.text)).then(function (responseMsgId) {
      return dispatch({type: prefixType + 'INPUTTED', groupId, id, payload: responseMsgId});
    }).catch(error => console.error(error));
  };
}

function restart(groupId, id) {
  return function (dispatch) {
    dispatch({type: prefixType + 'RESTARTING', groupId, id, meta: {track: true}});

    client.restartInstance()
      .then(() => dispatch({type: prefixType + 'RESTARTED', groupId, id, meta: {track: true}}))
      .catch(error => dispatch({type: prefixType + 'RESTARTED', groupId, id, payload: error, error: true, meta: {track: true}}));
  };
}

function showSelectWorkingDirectoryDialog(groupId, id) {
  return function (dispatch, getState) {
    const state = getState(),
      content = commonTabsActions.getContent(state.freeTabGroups, groupId, id);

    return api.send('openDialog', {
      title: 'Select a folder',
      defaultPath: content.cwd || local.get('workingDirectory'),
      properties: ['openDirectory']
    }).then(function (result) {
      if (_.isArray(result) && result.length > 0) {
        result = result[0];
      }

      if (_.isString(result)) {
        return dispatch(execute(groupId, id, {text: `cd "${result}"`}));
      }
    }).catch(error => console.error(error));
  };
}

function interrupt(groupId, id) {
  return function (dispatch) {
    dispatch({type: prefixType + 'INTERRUPTING', groupId, id});

    client.interrupt()
      .then(() => dispatch({type: prefixType + 'INTERRUPTING', groupId, id}))
      .catch(error => dispatch({type: prefixType + 'INTERRUPTING', groupId, id, payload: error, error: true, meta: {track: true}}));
  };
}

function clear(groupId, id) {
  return {type: prefixType + 'CLEAR', groupId, id};
}

function autocomplete(groupId, id, payload) {
  return {type: prefixType + 'AUTOCOMPLETE', groupId, id, payload, meta: {sender: 'self'}};
}

function installPythonModule(groupId, id, name, version) {
  return function (dispatch) {
    const packageInstaller = local.get('pythonPackageInstaller'),
      packageInstallCommand = getPackageInstallCommand(name, version, packageInstaller);

    return dispatch(execute(groupId, id, {text: packageInstallCommand}));
  };
}

function installPythonModuleExternally(groupId, id, name) {
  return function (dispatch) {
    const cmd = local.get('pythonCmd'),
      code = [
        'import pip',
        `pip.main(["install", "--disable-pip-version-check", "-qq", "${name}"])`
      ].join('\n'),
      args = ['-u', '-c', code];

    dispatch({type: 'PACKAGE_INSTALLING_EXTERNALLY', cmd, args, meta: {sender: 'self'}});
    return api.send('executeProcess', cmd, ['-u', '-c', code])
      .then(result => dispatch({type: prefixType + 'PACKAGE_INSTALLED_EXTERNALLY', payload: result}))
      .catch(error => dispatch({type: prefixType + 'PACKAGE_INSTALLED_EXTERNALLY', payload: error, error: true}));
  };
}

export default {
  autocomplete,
  clear,
  clickAnnotation,
  copyAnnotation,
  execute,
  input,
  installPythonModule,
  installPythonModuleExternally,
  interrupt,
  showSelectWorkingDirectoryDialog,
  restart
};
