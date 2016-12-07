import _ from 'lodash';
import mapReducers from '../../services/map-reducers';
import reduxUtil from '../../services/redux-util';

const prefix = reduxUtil.fromFilenameToPrefix(__filename);

export function getInitialState() {
  return {
    searchValue: ''
  };
}

function searchValueChanged(state, action) {
  if (state.searchValue !== action.payload) {
    state = state.set('searchValue', action.payload);
  }

  return state;
}

function searchFetching(state, action) {
  state = state.without('packages', 'limit', 'size');

  return state.set('searching', action.payload);
}

function searchFetched(state, action) {
  state = state.without('searching');

  if (!action.error) {
    state = state.merge(_.pick(action.payload, ['packages', 'limit', 'size']));
  }

  return state;
}

function releaseDataFetching(state, action) {
  const payload = action.payload,
    name = payload,
    resultIndex = _.findIndex(state.packages, {name});

  if (resultIndex > -1) {
    state.setIn(['packages', resultIndex, 'loading'], true);
  }

  return state;
}

function releaseDataFetched(state, action) {
  const payload = action.payload;

  if (!payload.error) {
    const name = payload.name,
      resultIndex = _.findIndex(state.packages, {name});

    if (resultIndex > -1) {
      state = state.setIn(['packages', resultIndex], action.payload.releaseData);
    }
  }

  return state;
}

function packageInstalling(state, action) {
  const payload = action.payload,
    name = payload.name,
    version = payload.version,
    resultIndex = _.findIndex(state.packages, {name});

  if (resultIndex > -1) {
    state = state.setIn(['packages', resultIndex, 'installing'], version);
  }

  return state;
}

function packageInstalled(state, action) {
  const payload = action.payload,
    name = payload.name,
    version = payload.version,
    resultIndex = _.findIndex(state.packages, {name});

  if (resultIndex > -1) {
    state = state.setIn(['packages', resultIndex, 'installing'], false);

    if (!action.error) {
      state = state.setIn(['packages', resultIndex, 'installed'], version);
    }
  }

  return state;
}

export default mapReducers(reduxUtil.addPrefixToKeys(prefix, {
  PACKAGE_INSTALLING: packageInstalling,
  PACKAGE_INSTALLED: packageInstalled,
  FETCHING: searchFetching,
  FETCHED: searchFetched,
  RELEASE_DATA_FETCHING: releaseDataFetching,
  RELEASE_DATA_FETCHED: releaseDataFetched,
  VALUE_CHANGED: searchValueChanged
}), getInitialState());
