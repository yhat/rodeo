import _ from 'lodash';
import bluebird from 'bluebird';
import pypi from '../../services/pypi';
import kernel from '../../actions/kernel';
import recommendedPackages from './recommended.yml';
import reduxUtil from '../../services/redux-util';
import {local} from '../../services/store';
import {getPackageInstallCommand} from '../../services/jupyter/python-language';

const prefix = reduxUtil.fromFilenameToPrefix(__filename);

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

function getReleaseByNameOnly(name) {
  return pypi.getReleases(name).then(function (versions) {
    if (_.isArray(versions) && versions.length > 0) {
      return pypi.getReleaseData(name, _.head(versions));
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
    name = packageInfo.name.toLowerCase(),
    summary = packageInfo.summary && packageInfo.summary.toLowerCase();

  // remove extra title
  if (firstLine === name || firstLine === summary) {
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

function searchByTerm(groupId, id, payload) {
  return function (dispatch) {
    const term = payload;

    dispatch({type: prefix + 'FETCHING', groupId, id, payload});
    return bluebird.all([
      getReleaseByNameOnly(term).catch(error => console.error('searchByTerm', {term, error})),
      pypi.search({name: term, summary: term, keywords: term}, 'or')
    ]).spread(function (specificPackage, packages) {
      if (!_.isArray(packages)) {
        return dispatch({type: prefix + 'FETCHED', groupId, id, payload: new Error('Nothing returned'), error: true});
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

      dispatch({type: prefix + 'FETCHED', groupId, id, payload: {term, packages, limit, size}});
    });
  };
}

function changeSearchValue(groupId, id, payload) {
  return {type: prefix + 'VALUE_CHANGED', groupId, id, payload};
}

function installPackage(groupId, id, name, version) {
  return function (dispatch) {
    const packageInstaller = local.get('pythonPackageInstaller'),
      packageInstallCommand = getPackageInstallCommand(name, version, packageInstaller);

    dispatch({type: prefix + 'PACKAGE_INSTALLING', groupId, id, payload: {name, version}});
    return dispatch(kernel.execute(packageInstallCommand))
      .then(() => dispatch({type: prefix + 'PACKAGE_INSTALLED', groupId, id, payload: {name, version}}))
      .catch(error => dispatch({type: prefix + 'PACKAGE_INSTALLED', groupId, id, payload: error, error: true}));
  };
}

function showMore(groupId, id, name, version) {
  return function (dispatch) {
    dispatch({type: prefix + 'RELEASE_DATA_FETCHING', groupId, id, payload: {name, version}});
    return pypi.getReleaseData(name, version)
      .then(function (releaseData) {
        normalizePackage(releaseData);
        dispatch({type: prefix + 'RELEASE_DATA_FETCHED', groupId, id, payload: {name, version, releaseData}});
      }).catch(error => dispatch({type: prefix + 'RELEASE_DATA_FETCHED', groupId, id, payload: error, error: true}));
  };
}

export default {
  changeSearchValue,
  installPackage,
  searchByTerm,
  showMore
};
