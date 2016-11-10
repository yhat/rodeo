import _ from 'lodash';
import mapReducers from '../../services/map-reducers';

function variablesChanged(state, action) {
  if (!_.isEqual(state.variables, action.payload)) {
    state = state.set('variables', action.payload);
  }

  return state;
}

export default mapReducers({
  VARIABLES_CHANGED: variablesChanged
}, {});
