import {send} from '../services/ipc';

export function showAboutRodeo() {
  return function (dispatch) {
    dispatch({type: 'LOADING_MODAL_DIALOG'});
    send('get_markdown', 'about-rodeo')
      .then(content => dispatch({type: 'ADD_MODAL_DIALOG', contentType: 'MARKED', content}))
      .catch(error => console.error(error));
  };
}

export function showAboutStickers() {
  return function (dispatch) {
    dispatch({type: 'LOADING_MODAL_DIALOG'});
    send('get_markdown', 'about-stickers')
      .then(content => dispatch({type: 'ADD_MODAL_DIALOG', contentType: 'STICKERS', content}))
      .catch(error => console.error(error));
  };
}

export default {
  showAboutRodeo,
  showAboutStickers
};
