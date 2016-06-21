import track from '../../services/track';

export function showURL(url) {
  track('sidebar', 'show_url', url);
  return {type: 'SHOW_URL_IN_SIDEBAR', url};
}

export function openURL(url) {
  track('sidebar', 'open_url', url);
  require('electron').shell.openExternal(url);
  return {type: 'OPEN_EXTERNAL_URL', url};
}

export function hide() {
  track('sidebar', 'hide');
  return {type: 'HIDE_URL_IN_SIDEBAR'};
}

export default {
  showURL,
  openURL,
  hide
};
