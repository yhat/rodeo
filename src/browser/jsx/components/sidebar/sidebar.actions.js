import track from '../../services/track';

export function showURL(url) {
  track({category: 'sidebar', action: 'show_url', label: url});
  return {type: 'SHOW_URL_IN_SIDEBAR', url};
}

export function openURL(url) {
  track({category: 'sidebar', action: 'open_url', label: url});
  require('electron').shell.openExternal(url);
  return {type: 'OPEN_EXTERNAL_URL', url};
}

export function hide() {
  track({category: 'sidebar', action: 'hide'});
  return {type: 'HIDE_URL_IN_SIDEBAR'};
}

export default {
  showURL,
  openURL,
  hide
};
