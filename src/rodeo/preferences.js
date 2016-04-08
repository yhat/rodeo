/**
 * @module
 *
 * todo: Stop relying on global state -- "state is poison"
 */

'use strict';

const fs = require('fs'),
  files = require('./files'),
  os = require('os'),
  path = require('path'),
  uuid = require('uuid'),
  preferencesFileName = '.rodeorc',
  homeDir = os.homedir();

/**
 * @param preferences
 */
function guaranteeId(preferences) {
  if (preferences.id === null || preferences.id === undefined) {
    preferences.id = uuid.v1().replace(/-/g, '');

    writePreferences(preferences); // todo: this shouldn't be in here, someone else's responsibility
  }
}

/**
 * @returns {object}
 */
function getPreferences() {
  let filePath = path.join(homeDir, preferencesFileName),
    contents = files.getJSONFileSafeSync(filePath) || {};

  guaranteeId(contents);

  return contents;
}

/**
 * @param {object} preferences
 * @throws if fails to write preferences
 * @throws if missing USER_HOME
 */
function writePreferences(preferences) {
  let filePath = path.join(homeDir, preferencesFileName);

  fs.writeFileSync(filePath, JSON.stringify(preferences, null, 2));
}

/**
 * @param {string} key
 * @param {*} value
 * @param {string} [userHome]  Optionally provide userHome
 */
function setPreferences(key, value, userHome) {
  const preferences = getPreferences(userHome);

  preferences[key] = value;

  writePreferences(preferences);
}

module.exports.getPreferences = getPreferences;
module.exports.writePreferences = writePreferences;

/**
 * @type {setPreferences}
 * @deprecated It's not performant to constantly write to skip in small steps -- make all changes first then save.
 * @see writePreferences
 */
module.exports.setPreferences = setPreferences;