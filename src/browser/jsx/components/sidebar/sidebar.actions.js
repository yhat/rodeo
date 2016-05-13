export function showURL(url) {
  return {type: 'SHOW_URL_IN_SIDEBAR',url};
}

export function hide() {
  return {type: 'HIDE_URL_IN_SIDEBAR'};
}

export default {
  showURL,
  hide
};
