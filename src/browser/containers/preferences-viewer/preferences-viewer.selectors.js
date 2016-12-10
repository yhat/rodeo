import _ from 'lodash';
import {createSelector} from 'reselect';

const modalDialogs = state => state.modalDialogs,
  getPreferencesViewer = createSelector(
    modalDialogs,
    modalDialogs => {
      const dialog = _.isObject(modalDialogs) && _.find(modalDialogs.items, {contentType: 'preferences'});

      return dialog && dialog.content;
    }
  );

export default {
  getPreferencesViewer
};
