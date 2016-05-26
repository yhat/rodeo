export function showURL(url) {
  return {type: 'SHOW_URL_IN_SIDEBAR', url};
}

export function openURL(url) {
  require('electron').shell.openExternal(url);
  return {type: 'OPEN_EXTERNAL_URL', url};
}

export function hide() {
  return {type: 'HIDE_URL_IN_SIDEBAR'};
}

export default {
  showURL,
  openURL,
  hide
};
