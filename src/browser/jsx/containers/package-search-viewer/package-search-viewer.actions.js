import _ from 'lodash';
import pypi from '../../services/pypi';
import terminalActions from '../terminal/terminal.actions';

function list() {
  return function (dispatch) {
    return pypi.list().then(function (list) {
      dispatch({type: 'PACKAGE_SEARCH_LIST', list});
    });
  };
}

function searchByTerm(term) {
  return function (dispatch) {
    return pypi.search({
      name: term,
      summary: term,
      keywords: term
    }, 'or').then(function (packages) {
      let limit = false,
        size = packages.length,
        max = 500;

      if (size > max) {
        packages.length = 500;
        limit = 500;
      }

      // packages = _.sortBy(packages, 'name');

      console.log('pypi', {packages});
      dispatch({type: 'PACKAGE_SEARCH_RESULTS', term, packages, limit, size});
    });
  };
}

function changeSearchValue(value) {
  return {type: 'PACKAGE_SEARCH_VALUE_CHANGED', value};
}

function installPackage(packageName, version) {
  if (!_.isString(packageName) || !_.isString(version)) {
    throw new Error('installPackage expects string');
  }

  return function (dispatch) {
    const isCodeIsolated = true;

    dispatch({type: 'PACKAGE_INSTALLING', packageName, version});
    dispatch(terminalActions.addInputText({text: `! pip install ${packageName}==${version}`, isCodeIsolated}))
      .then(() => dispatch({type: 'PACKAGE_INSTALLED', packageName, version}))
      .catch(error => dispatch({type: 'PACKAGE_INSTALLED', packageName, version, error}));
  };
}

function showMore(packageName, version) {
  return function (dispatch) {
    dispatch({type: 'PACKAGE_SEARCH_RELEASE_DATA_FETCHING', packageName, version});
    return pypi.getReleaseData(packageName, version)
      .then(function (releaseData) {
        console.log('pypi', {releaseData});
        dispatch({type: 'PACKAGE_SEARCH_RELEASE_DATA_FETCHED', packageName, version, releaseData});
      }).catch(error => console.error(error));
  };
}

export default {
  changeSearchValue,
  installPackage,
  list,
  searchByTerm,
  showMore
};
