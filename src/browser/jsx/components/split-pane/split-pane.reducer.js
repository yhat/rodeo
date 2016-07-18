import _ from 'lodash';
import $ from 'jquery';
import {local} from '../../services/store';
import mapReducers from '../../services/map-reducers';

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
      state[action.id] = position + 'px';
      local.set('splitPanePositions', state);
      state = _.clone(state);
    }
  }

  return state;
}

export default mapReducers({
  SPLIT_PANE_DRAG: savePosition
}, {});
