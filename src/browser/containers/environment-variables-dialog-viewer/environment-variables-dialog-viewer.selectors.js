import _ from 'lodash';
import {createSelector} from 'reselect';

const contentType = 'environmentVariables',
  modalDialogs = state => state.modalDialogs,
  getEnvironmentVariablesViewer = createSelector(
    modalDialogs,
    modalDialogs => {
      const dialog = _.isObject(modalDialogs) && _.find(modalDialogs.items, {contentType});

      return dialog && dialog.content;
    }
  );

export default {
  getEnvironmentVariablesViewer
};
