'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  docStringCache = {},
  fs = require('fs'),
  executeOptions = {
    silent: true,
    storeHistory: false,
    allowStdin: false,
    stopOnError: true
  };

/**
 *
 * @param {JupyterClient} client
 * @param {string} text
 * @param {number} cursorPos
 * @returns {object}
 */
function getRichAutoComplete(client, text, cursorPos) {
  return bluebird.join(
    client.getAutoComplete(text, cursorPos),
    applyDocStringGetter(client)
  ).then(function (result) {
    let promises = [];

    _.each(result.matches, function (match, i) {
      if (docStringCache[match]) {
        result.matches[i] = {text: match, docString: docStringCache[match]};
      } else {
        promises.push(client.execute(docStringFetch, {
          silent: true,
          storeHistory: false,
          allowStdin: false,
          stopOnError: true
        }));
      }
    });

    log('info', result);
    return bluebird.all(result).then(function () {
      return result;
    });
  });
}
