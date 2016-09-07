import _ from 'lodash';
import mapReducers from '../../services/map-reducers';

const initialState = {
  searchValue: '',
  packages: []
};

function searchValueChanged(state, action) {
  if (state.searchValue !== action.value) {
    state = _.clone(state);
    state.searchValue = action.value;
  }

  return state;
}

function resultsFound(state, action) {
  state = _.clone(state);
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

function isLikelyMarkdown(str) {
  const hasHashHeaders = !!str.match(/\n#{1,5} ?[^#\n ]+\n\n/mg),
    hasLinks = !!str.match(/\[.+\]\(.+\)/),
    hasCodeBlocks = !!str.match(/\n```[\s\S]*\n```/mg);

  return hasHashHeaders || hasLinks || hasCodeBlocks;
}

function removeExtraTitleFromDescription(releaseData) {
  let description = releaseData.description.trim();
  const lines = description.split('\n', 2),
    firstLine = lines[0] && lines[0].trim().toLowerCase(),
    secondLine = lines[1] && lines[1].trim(),
    packageName = releaseData.name.toLowerCase(),
    summary = releaseData.summary && releaseData.summary.toLowerCase();

  // remove extra title
  if (firstLine === packageName || firstLine === summary) {
    if (secondLine && secondLine && secondLine[0] === secondLine[secondLine.length - 1]) {
      releaseData.description = description.substr(firstLine.length + secondLine.length + 2).trim();
    } else {
      releaseData.description = description.substr(firstLine.length + 1).trim();
    }
  }

  return releaseData;
}

function normalizePackageReleaseData(packageName, releaseData) {
  releaseData = _.clone(releaseData);

  _.each(releaseData, (value, key) => {
    if (_.isString(value) && value.trim() === 'UNKNOWN') {
      delete releaseData[key];
    }
  });

  if (_.isString(releaseData.description)) {
    releaseData = removeExtraTitleFromDescription(releaseData);
    releaseData.isLikelyMarkdown = isLikelyMarkdown(releaseData.description);
  }

  return releaseData;
}

function releaseDataFetched(state, action) {
  const resultIndex = _.findIndex(state.packages, {name: action.packageName});

  if (resultIndex > -1) {
    const releaseData = normalizePackageReleaseData(action.packageName, action.releaseData);

    state = _.clone(state);
    state.packages = _.clone(state.packages);
    state.packages[resultIndex] = releaseData;
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
  PACKAGE_SEARCH_RESULTS: resultsFound,
  PACKAGE_SEARCH_RELEASE_DATA_FETCHING: releaseDataFetching,
  PACKAGE_SEARCH_RELEASE_DATA_FETCHED: releaseDataFetched,
  PACKAGE_SEARCH_VALUE_CHANGED: searchValueChanged
}, initialState);
