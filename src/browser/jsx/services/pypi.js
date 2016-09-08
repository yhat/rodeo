import _ from 'lodash';
import xmlrpc from './xmlrpc';

const baseUrl = 'https://pypi.python.org/pypi'; // missing packages
// const baseUrl = 'https://pypi.io/pypi'; // 404

/**
 *
 * NOTES:
 *
 * The _ and - characters are equivalent in package names.
 *
 * @module
 */

/**
 * @param {string} packageName
 * @param {string} releaseVersion
 * @returns {Promise<object>}
 */
function getReleaseData(packageName, releaseVersion) {
  return new xmlrpc.Client(baseUrl).call('release_data', {packageName, releaseVersion});
}

function getReleases(packageName) {
  return new xmlrpc.Client(baseUrl).call('package_releases', {packageName});
}

function getRoles(packageName) {
  return new xmlrpc.Client(baseUrl).call('package_roles', {packageName});
}

function getReleaseDownloads(packageName, releaseVersion) {
  return new xmlrpc.Client(baseUrl).call('release_downloads', {packageName, releaseVersion});
}

function search(spec, operator) {
  return new xmlrpc.Client(baseUrl).call('search', {spec, operator});
}

function list() {
  return new xmlrpc.Client(baseUrl)
    .call('list_packages')
    .then(xmlrpc.expectStringArray);
}

export default {
  list,
  getReleases,
  getReleaseData,
  getReleaseDownloads,
  getRoles,
  search
};
