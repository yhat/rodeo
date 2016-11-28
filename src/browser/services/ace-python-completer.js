import _ from 'lodash';
import cid from './cid';
import client from './jupyter/client';
import textUtil from './text-util';

const className = 'rodeo-ace-pane-docstring';

/**
 * @param {Error} error
 */
function reportError(error) {
  console.error('ace-python-completer', error);
}

/**
 * @param {[string]} matches
 * @param {string} prefix
 * @returns {[string]}
 */
function filterByStartingText(matches, prefix) {
  return _.filter(matches, match => _.startsWith(match, prefix));
}

/**
 * @param {object} context
 * @returns {Function}
 */
function handleMatch(context) {
  const prefix = context.prefix,
    matchPrefix = context.matchPrefix;

  return function (match) {
    let value = match,
      id = cid(),
      score = 100,
      meta;

    if (_.startsWith(match, matchPrefix)) {
      value = prefix + match.substr(matchPrefix.length);
    }

    if (value !== match) {
      meta = match;
    }

    return {
      rodeoExtras: _.assign({id, match}, context),
      caption: value, // thing shown on left
      value,
      score,
      meta // thing shown on right
    };
  };
}

/**
 * @param {string} id
 * @param {string} value
 * @returns {Promise}
 */
function fillAutocompleteElementById(id, value) {
  return client.executeHidden('?' + value, 'execute_reply').then(function (result) {
    const text = _.get(result, 'payload[0].data["text/plain"]'),
      el = document.querySelector('#' + id);

    if (text && el) {
      el.style.display = 'block';
      el.style.opacity = 0;
      el.innerHTML = textUtil.fromAsciiToHtml(text);
      _.defer(() => el.style.opacity = 1);
    }
  });
}

/**
 * @param {ace.Editor} editor
 * @param {ace.EditSession} session
 * @param {{row: number, column: number}} pos
 * @param {string} prefix
 * @param {function} callback
 * @returns {Promise}
 */
/* eslint max-params: 0 */
function getCompletions(editor, session, pos, prefix, callback) {
  session.$mode.$keywordList = [];
  const code = session.getValue(),
    cursorPos = textUtil.getCursorPosFromRowColumn(code, pos.row, pos.column);

  return client.getAutoComplete(code, cursorPos).then(function (result) {
    const matchPrefix = session.getTextRange({
      start: {
        row: pos.row,
        column: pos.column - (cursorPos - result.cursor_start)
      }, end: pos
    });

    // remove matches that are not really matches
    if (prefix && matchPrefix) {
      result.matches = filterByStartingText(result.matches, matchPrefix);
    }

    callback(null, _.map(result.matches, handleMatch({
      prefix,
      matchPrefix,
      code
    })));
  }).catch(reportError);
}

function getDocTooltip(item) {
  const extras = item.rodeoExtras,
    id = 'autocomplete-result-' + extras.id;

  // no return here, allow to fail, report failure
  fillAutocompleteElementById(id, extras.match)
    .catch(reportError);

  return {
    docHTML: '<div class="' + className + '" style="overflow: auto; display: none;" id="' + id + '"></div>'
  };
}

export default {
  getCompletions,
  getDocTooltip
};

