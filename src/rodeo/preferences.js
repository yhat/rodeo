'use strict';

const fs = require('fs'),
  files = require('./files'),
  path = require('path'),
  uuid = require('uuid'),
  preferencesFileName = '.rodeorc';

function guaranteeId(preferences) {
  if (preferences.id === null || preferences.id === undefined) {
    preferences.id = uuid.v1().replace(/-/g, '');

    writePreferences(preferences); // this shouldn't be in here
  }
}

/**
 * @returns {object}
 * @throws if global.USER_HOME is undefined
 */
function getPreferences() {
  const userHome = global.USER_HOME;

  if (!userHome) {
    throw new Error('Missing USER_HOME');
  }

  let filePath = path.join(userHome, preferencesFileName),
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
  const userHome = global.USER_HOME;

  if (!userHome) {
    throw new Error('Missing USER_HOME');
  }

  let filePath = path.join(userHome, preferencesFileName);

  fs.writeFileSync(filePath, JSON.stringify(preferences, null, 2));
}

/**
 *
 * @param {string} key
 * @param {*} value
 */
function setPreferences(key, value) {
  const preferences = getPreferences();

  preferences[key] = value;

  writePreferences(preferences);
}

module.exports.getPreferences = getPreferences;
module.exports.setPreferences = setPreferences;
