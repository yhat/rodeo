import $ from 'jquery';
import * as store from '../../services/store';
import mapReducers from '../../services/map-reducers';

const positions = store.get('splitPanePositions') || {
  'split-pane-center': window.innerWidth / 2 + 'px',
  'split-pane-right': window.innerHeight / 2 + 'px',
  'split-pane-left': window.innerHeight / 2 + 'px'
};

function savePosition(state, action) {
  const el = document.querySelector('#' + action.id);

  if (el) {
    let position,
      splitter = $(el).split(),
      orientation = splitter.orientation;

    if (orientation === 'horizontal') {
      position = el.firstChild.clientHeight;
    } else if (orientation === 'vertical') {
      position = el.firstChild.clientWidth;
    }

    if (position) {
      positions[action.id] = position + 'px';
      store.set('splitPanePositions', positions);
    }
  }

  return state;
}

export default mapReducers({
  SPLIT_PANE_DRAG_END: savePosition
}, positions);
