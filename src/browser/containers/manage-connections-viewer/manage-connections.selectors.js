import _ from 'lodash';
import {createSelector} from 'reselect';

const contentType = 'manageConnections',
  modalDialogs = state => state.modalDialogs,
  getConnectionsViewer = createSelector(
    modalDialogs,
    modalDialogs => {
      const dialog = _.isObject(modalDialogs) && _.find(modalDialogs.items, {contentType});

      return dialog && dialog.content;
    }
  );

export default {
  getConnectionsViewer
};
