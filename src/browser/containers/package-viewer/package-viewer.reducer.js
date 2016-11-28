import _ from 'lodash';
import mapReducers from '../../services/map-reducers';

const initialState = {
  list: []
};

function packagesDetected(state, action) {
  if (!_.isEqual(state.packages, action.packages)) {
    state = _.clone(state);
    state.list = action.packages;
  }

  return state;
}

export default mapReducers({
  PACKAGES_DETECTED: packagesDetected
}, initialState);
