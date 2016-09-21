import _ from 'lodash';
import mapReducers from '../../services/map-reducers';

export function getInitialState() {
  return {
    searchValue: ''
  };
}

function searchValueChanged(state, action) {
  if (state.searchValue !== action.value) {
    state = _.clone(state);
    state.searchValue = action.value;
  }

  return state;
}

function searchFetching(state, action) {
  state = _.clone(state);

  delete state.packages;
  delete state.limit;
  delete state.size;
  state.searching = action.term;

  return state;
}

function searchFetched(state, action) {
  state = _.clone(state);
  delete state.searching;

  if (action.error) {
    console.error(__filename, 'searchFetched', action);
    return state;
  }

  state.packages = action.packages;
  state.limit = action.limit;
  state.size = action.size;

  return state;
}

function releaseDataFetching(state, action) {
  const resultIndex = _.findIndex(state.packages, {name: action.packageName});

  if (resultIndex > -1) {
    state = _.clone(state);
    state.packages = _.clone(state.packages);
    state.packages[resultIndex] = _.assign({loading: true}, state.packages[resultIndex]);
  }

  return state;
}

function releaseDataFetched(state, action) {
  const resultIndex = _.findIndex(state.packages, {name: action.packageName});

  if (resultIndex > -1) {
    state = _.clone(state);
    state.packages = _.clone(state.packages);
    state.packages[resultIndex] = action.releaseData;
  }

  return state;
}

function packageInstalling(state, action) {
  const resultIndex = _.findIndex(state.packages, {name: action.packageName});

  if (resultIndex > -1) {
    state = _.clone(state);
    state.packages = _.clone(state.packages);
    state.packages[resultIndex] = _.assign({installing: action.version}, state.packages[resultIndex]);
  }

  return state;
}

function packageInstalled(state, action) {
  const resultIndex = _.findIndex(state.packages, {name: action.packageName});

  if (resultIndex > -1) {
    state = _.clone(state);
    state.packages = _.clone(state.packages);
    if (action.error) {
      console.error(__filename, 'packageInstalled', action);
      state.packages[resultIndex] = _.assign({installing: false}, state.packages[resultIndex]);
    } else {
      console.log(__filename, 'packageInstalled', action);
      state.packages[resultIndex] = _.assign({installing: false, installed: action.version}, state.packages[resultIndex]);
    }
  }

  return state;
}

export default mapReducers({
  PACKAGE_INSTALLING: packageInstalling,
  PACKAGE_INSTALLED: packageInstalled,
  PACKAGE_SEARCH_FETCHING: searchFetching,
  PACKAGE_SEARCH_FETCHED: searchFetched,
  PACKAGE_SEARCH_RELEASE_DATA_FETCHING: releaseDataFetching,
  PACKAGE_SEARCH_RELEASE_DATA_FETCHED: releaseDataFetched,
  PACKAGE_SEARCH_VALUE_CHANGED: searchValueChanged
}, getInitialState());
