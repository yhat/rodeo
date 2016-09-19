import _ from 'lodash';
import bluebird from 'bluebird';
import ipc from 'ipc';
import pypi from '../../services/pypi';
import terminalActions from '../terminal-tab-group/terminal-tab-group.actions';
import recommendedPackages from './recommended.yml';

function list() {
  return function (dispatch) {
    return pypi.list().then(function (list) {
      dispatch({type: 'PACKAGE_SEARCH_LIST', list});
    });
  };
}

/**
 * @param {string} term
 * @param {Array} packages
 * @param {object} [specificPackage]
 * @returns {Array}
 */
function sortSearchResultsWithTerm(term, packages, specificPackage) {
  const pulled = [],
    exactTerm = [],
    includesTerm = [],
    recommended = [];

  _.each(packages, (packageInfo, index) => {
    const name = packageInfo.name;

    if (name === term) {
      pulled.push(index);

      if (!specificPackage) {
        exactTerm.push(packageInfo);
      }
    } else if (_.includes(recommendedPackages, name)) {
      pulled.push(index);
      recommended.push(_.assign({recommended: true}, packageInfo));
    } else if (_.includes(name, term)) {
      pulled.push(index);
      includesTerm.push(packageInfo);
    }
  });

  _.pullAt(packages, pulled);

  if (specificPackage) {
    exactTerm.push(specificPackage);
  }

  if (exactTerm.length && _.includes(recommendedPackages, exactTerm[0].name)) {
    _.assign(exactTerm[0], {recommended: true});
  }

  return exactTerm.concat(recommended, includesTerm, packages);
}

function getReleaseByNameOnly(packageName) {
  return pypi.getReleases(packageName).then(function (versions) {
    if (_.isArray(versions) && versions.length > 0) {
      return pypi.getReleaseData(packageName, _.head(versions));
    }

    return null;
  });
}

function removeUnknowns(packageInfo) {
  _.each(packageInfo, (value, key) => {
    if (_.isString(value) && value.trim() === 'UNKNOWN') {
      delete packageInfo[key];
    }
  });
}

function isLikelyMarkdown(str) {
  const hasHashHeaders = !!str.match(/\n#{1,5} ?[^#\n ]+\n\n/mg),
    hasLinks = !!str.match(/\[.+\]\(.+\)/),
    hasCodeBlocks = !!str.match(/\n```[\s\S]*\n```/mg);

  return hasHashHeaders || hasLinks || hasCodeBlocks;
}

function removeExtraTitleFromDescription(packageInfo) {
  let description = packageInfo.description.trim();
  const lines = description.split('\n', 2),
    firstLine = lines[0] && lines[0].trim().toLowerCase(),
    secondLine = lines[1] && lines[1].trim(),
    packageName = packageInfo.name.toLowerCase(),
    summary = packageInfo.summary && packageInfo.summary.toLowerCase();

  // remove extra title
  if (firstLine === packageName || firstLine === summary) {
    if (secondLine && secondLine && secondLine[0] === secondLine[secondLine.length - 1]) {
      packageInfo.description = description.substr(firstLine.length + secondLine.length + 2).trim();
    } else {
      packageInfo.description = description.substr(firstLine.length + 1).trim();
    }
  }
}

function normalizePackage(packageInfo) {
  removeUnknowns(packageInfo);

  if (_.isString(packageInfo.description)) {
    removeExtraTitleFromDescription(packageInfo);
    packageInfo.isLikelyMarkdown = isLikelyMarkdown(packageInfo.description);
  }
}

function searchByTerm(term) {
  return function (dispatch) {
    dispatch({type: 'PACKAGE_SEARCH_FETCHING', term});

    return bluebird.all([
      getReleaseByNameOnly(term).catch(error => console.error('searchByTerm', {term, error})),
      pypi.search({name: term, summary: term, keywords: term}, 'or')
    ]).spread(function (specificPackage, packages) {
      if (!_.isArray(packages)) {
        return dispatch({type: 'PACKAGE_SEARCH_FETCHED', error: packages});
      }

      packages = sortSearchResultsWithTerm(term, packages, specificPackage);

      let limit = false,
        size = packages.length,
        max = 500;

      if (size > max) {
        packages.length = 500;
        limit = 500;
      }

      _.each(packages, normalizePackage);

      console.log('pypi', {packages});
      dispatch({type: 'PACKAGE_SEARCH_FETCHED', term, packages, limit, size});
    });
  };
}

function changeSearchValue(value) {
  return {type: 'PACKAGE_SEARCH_VALUE_CHANGED', value};
}

function openExternal(url) {
  return function () {
    return ipc.send('openExternal', url);
  };
}

function installPackage(packageName, version) {
  if (!_.isString(packageName) || !_.isString(version)) {
    throw new Error('installPackage expects string');
  }

  return function (dispatch) {
    const isCodeIsolated = true;

    dispatch({type: 'PACKAGE_INSTALLING', packageName, version});
    dispatch(terminalActions.addInputTextToActiveTab(null, {text: `! pip install ${packageName}==${version}`, isCodeIsolated}))
      .then(() => dispatch({type: 'PACKAGE_INSTALLED', packageName, version}))
      .catch(error => dispatch({type: 'PACKAGE_INSTALLED', packageName, version, error}));
  };
}

function showMore(packageName, version) {
  return function (dispatch) {
    dispatch({type: 'PACKAGE_SEARCH_RELEASE_DATA_FETCHING', packageName, version});
    return pypi.getReleaseData(packageName, version)
      .then(function (releaseData) {
        console.log('showMore', {releaseData});
        normalizePackage(releaseData);
        dispatch({type: 'PACKAGE_SEARCH_RELEASE_DATA_FETCHED', packageName, version, releaseData});
      }).catch(error => console.error(error));
  };
}

export default {
  changeSearchValue,
  installPackage,
  list,
  searchByTerm,
  showMore,
  openExternal
};
