import { combineReducers } from 'redux';
import applicationControl from '../services/application-control';
import fileView from './file-viewer/file-viewer.reducer';
import modalDialogs from './modal-dialog-viewer/modal-dialog.reducer';
import sidebar from '../components/sidebar/sidebar.reducer';
import notifications from '../components/notifications/notifications.reducer';
import freeTabGroups from './free-tab-group/free-tab-group.reducer';
import editorTabGroups from './editor-tab-group/editor-tab-group.reducer';

function broadcast(state, action) {
  applicationControl.shareAction(action);

  if (!state) {
    return {};
  }

  return state;
}

/**
 * This is the global application state.  Each item here is a slice that is managed by particular reducer.
 *
 * Note that each change to the global application state results in a _completely cloned new object_, so do
 * not put large data here.  The entire application state will also be forwarded when there is an exception, so
 * functions, symbols, null, and other things that do not translate to JSON are not allowed and will not be persisted.
 */
export default combineReducers({
  /**
   * stack! Modals are stacked up in order, and closed in order, FILO.
   */
  modalDialogs,
  /**
   * stack! Notifications are stacked up in order, but they can be closed in any order.
   */
  notifications,
  /**
   * singleton! Only one sidebar should be active at a time, and if a new one wants to open, it should replace
   * the old one.
   */
  sidebar,
  /**
   * list! There are many free tab groups, and potentially more created or destroyed as panes are moved around
   */
  freeTabGroups,
  /**
   * list! There are many editor tab groups, and potentially more created or destroyed as panes are moved around. It is
   * _really_ useful to have every editor in one spot, even if in the future they're in different tab groups.
   * The tab and the editor are tightly coupled so the tab can change its look based on the state of the file
   * in the editor.
   */
  editorTabGroups,
  /**
   * singleton! Only one file view should ever be on the screen at the time for the sake of other components
   * to interact and change themselves based on the state of the fileview.
   */
  fileView,
  /**
   * Logs all the actions that pass through, and broadcasts them to other windows.
   */
  broadcast
});
