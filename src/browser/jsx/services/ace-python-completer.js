import _ from 'lodash';
import cid from './cid';
import client from './client';
import textUtil from './text-util';
import AsciiToHtml from 'ansi-to-html';

const convertor = new AsciiToHtml();

/**
 * @param {[string]} matches
 * @param {string} prefix
 * @returns {[string]}
 */
function filterByStartingText(matches, prefix) {
  return _.filter(matches, match => _.startsWith(match, prefix));
}

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

    // if it's not a filename and there's a '.' in the value, we want
    // to set the value to just the last item in the list
    if (value.indexOf('/') == -1 && value.indexOf('.') > -1) {
      value = value.split('.').slice(value.split('.').length - 1).join('.');
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
      el.innerHTML = convertor.toHtml(text);
      _.defer(() => el.style.opacity = 1);
    }
  });
}

/* eslint max-params: 0 */
export default {
  /**
   *
   * @param {ace.Editor} editor
   * @param {ace.EditSession} session
   * @param {{row: number, column: number}} pos
   * @param {string} prefix
   * @param {function} callback
   * @returns {Promise}
   */
  getCompletions: function (editor, session, pos, prefix, callback) {
    session.$mode.$keywordList = [];
    const code = session.getValue(),
      cursorPos = textUtil.getCursorPosFromRowColumn(code, pos.row, pos.column);

    return client.getAutoComplete(code, cursorPos).then(function (result) {

      const matchLen = result.cursor_end - result.cursor_start,
        matchPrefix = session.getTextRange({start: {
          row: pos.row,
          column: pos.column - (cursorPos - result.cursor_start)
        }, end: pos}),
        postfix = session.getTextRange({start: pos, end: {
          row: pos.row,
          column: pos.column + matchLen
        }});

      // remove matches that are not really matches
      if (prefix && matchPrefix) {
        result.matches = filterByStartingText(result.matches, matchPrefix);
      }

      callback(null, _.map(result.matches, handleMatch({
        prefix,
        postfix,
        pos,
        cursorPos,
        result,
        code
      })));
    }).catch(error => console.error(error));
  },

  getDocTooltip: function (item) {
    const extras = item.rodeoExtras,
      id = 'autocomplete-result-' + extras.id;

    // no return here, allow to fail, report failure
    fillAutocompleteElementById(id, extras.match)
      .catch(error => console.error('errrrrr', error));

    return {
      docHTML: '<div class="rodeo-ace-pane-docstring" style="overflow: auto; display: none;" id="' + id + '"></div>'
    };
  }
};

