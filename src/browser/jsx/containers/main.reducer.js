import { combineReducers } from 'redux';
import applicationControl from '../services/application-control';
import plots from './plot-viewer/plot-viewer.reducer';
import fileView from './file-viewer/file-viewer.reducer';
import modalDialogs from './modal-dialog-viewer/modal-dialog.reducer';
import sidebar from '../components/sidebar/sidebar.reducer';
import notifications from '../components/notifications/notifications.reducer';
import terminalTabGroups from './terminal-tab-group/terminal-tab-group.reducer';
import freeTabGroups from './free-tab-group/free-tab-group.reducer';
import editorTabGroups from './editor-tab-group/editor-tab-group.reducer';
import preferences from './preferences-viewer/preferences-viewer.reducer';
import packages from './package-viewer/package-viewer.reducer';
import packageSearch from './package-search-viewer/package-search-viewer.reducer';

function broadcast(state, action) {
  console.log(action.type, action);

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
   * list! The tab and the terminals are tightly coupled so the tab can change its look based on the state of the terminal.
   */
  terminalTabGroups,
  /**
   * map!
   */
  preferences,
  /**
   * map!
   */
  packageSearch,
  /**
   * singleton! Only one file view should ever be on the screen at the time for the sake of other components
   * to interact and change themselves based on the state of the fileview.
   */
  fileView,
  /**
   * Unneeded. This just logs all the actions that pass through.
   */
  broadcast
});
