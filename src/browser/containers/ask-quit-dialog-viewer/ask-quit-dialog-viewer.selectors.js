import _ from 'lodash';
import {createSelector} from 'reselect';

const contentType = 'askQuit',
  modalDialogs = state => state.modalDialogs,
  getAskQuit = createSelector(
    modalDialogs,
    modalDialogs => {
      const dialog = _.isObject(modalDialogs) && _.find(modalDialogs.items, {contentType});

      return dialog && dialog.content;
    }
  );

export default {
  getAskQuit
};
