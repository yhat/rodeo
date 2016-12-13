import _ from 'lodash';
import cid from '../../services/cid';
import {getInitialState as getPreferencesInitialState} from '../preferences-viewer/preferences-viewer.reducer';
import {getInitialState as getEnvironmentVariableViewerInitialState}
  from '../environment-variables-dialog-viewer/environment-variables-dialog-viewer.reducer';

const defaultItemTypes = {
  aboutRodeo: () => ({}),
  aboutStickers: () => ({title: 'Stickers'}),
  acknowledgements: () => ({title: 'Acknowledgements'}),
  askQuit: () => ({
    modalSize: 'small',
    title: 'Quit'
  }),
  environmentVariables: () => ({
    content: getEnvironmentVariableViewerInitialState(),
    modalSize: 'full',
    title: 'Environment Variables'
  }),
  manageConnections: () => ({
    title: 'Manage Connections',
    content: {
      list: []
    }
  }),
  preferences: () => ({
    content: getPreferencesInitialState(),
    modalSize: 'full',
    title: 'Preferences'
  }),
  registerRodeo: () => ({
    modalSize: 'full',
    title: 'Register Rodeo'
  })
};

function getDefault(contentType) {
  let item = defaultItemTypes[contentType];

  if (!_.isFunction(item)) {
    throw new Error(`contentType ${contentType} does not exist in defaultItemTypes`);
  }

  item = item();
  item.id = cid();
  item.contentType = contentType;

  return item;
}

export default {
  getDefault
};
