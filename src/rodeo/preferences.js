'use strict';

const fs = require('fs'),
  files = require('./files'),
  path = require('path'),
  uuid = require('uuid'),
  preferencesFileName = '.rodeorc';

function guaranteeId(preferences) {
  if (preferences.id === null || preferences.id === undefined) {
    preferences.id = uuid.v1().replace(/-/g, '').toString();

    writePreferences(preferences); // this shouldn't be in here
  }
}

/**
 * @returns {object}
 * @throws if global.USER_HOME is undefined
 */
function getPreferences() {
  if (!USER_HOME) {
    throw new Error('Missing USER_HOME');
  }

  const filePath = path.join(USER_HOME, preferencesFileName);
  let contents = files.getJSONFileSafeSync(filePath) || {};

  guaranteeId(contents);

  return contents;
}

/**
 * @param {object} preferences
 * @throws if fails to write preferences
 * @throws if missing USER_HOME
 */
function writePreferences(preferences) {
  if (!USER_HOME) {
    throw new Error('Missing USER_HOME');
  }

  const filePath = path.join(USER_HOME, preferencesFileName);

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
