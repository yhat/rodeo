import _ from 'lodash';
import cid from '../../services/cid';
import {getInitialState as getPreferencesInitialState} from '../preferences-viewer/preferences-viewer.reducer';

const defaultItemTypes = {
  aboutRodeo: () => ({}),
  aboutStickers: () => ({title: 'Stickers'}),
  acknowledgements: () => ({title: 'Acknowledgements'}),
  askQuit: () => ({title: 'Quit'}),
  preferences: () => ({
    content: getPreferencesInitialState()
  }),
  registerRodeo: () => ({title: 'Register Rodeo'})
};

function getDefault(contentType) {
  let item = defaultItemTypes[contentType];

  if (_.isFunction(item)) {
    item = item();
    item.id = cid();
    item.contentType = contentType;
  }

  return item;
}

export default {
  getDefault
};
