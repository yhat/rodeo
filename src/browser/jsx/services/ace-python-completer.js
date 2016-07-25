import _ from 'lodash';
import cid from './cid';
import client from './client';
import textUtil from './text-util';
import AsciiToHtml from 'ansi-to-html';

const convertor = new AsciiToHtml();

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

    console.log({editor, session, pos, prefix, callback});

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

      console.log({prefix, matchPrefix, postfix, result, callback});

      // remove matches that are not really matches
      if (prefix) {
        result.matches = _.filter(result.matches, function (match) {
          return _.startsWith(match, matchPrefix);
        });
      }

      callback(null, _.map(result.matches, function (match) {
        let value = match,
          id = cid(),
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
          rodeoExtras: {
            id,
            prefix,
            pos,
            cursorPos,
            result,
            match,
            code
          },
          docHTML: '<span id="autocomplete-' + id + '" />',
          caption: value, // thing shown on left
          value,
          score: 100,
          meta // thing shown on right
          // docHTML: '<code>' + match + '</code>' + '<br/>' + '<br/>' + '<pre style=\'margin: 0; padding: 0;\'>' +
          //   p.docstring + '</pre>' || '<p>' + match + '</p>'
          // snippet: match, // thing that can replace section
        };
      }));
    }).catch(error => console.error(error));
  },

  getDocTooltip: function (item) {
    console.log('getDocTooltip', this, arguments);

    const extras = item.rodeoExtras,
      id = 'autocomplete-result-' + extras.id;

    client.executeHidden('?' + item.caption, 'execute_reply').then(function (result) {
      const text = _.get(result, 'payload[0].data["text/plain"]'),
        el = document.querySelector('#' + id);

      console.log('executeHidden', '?' + item.caption, 'execute_reply', result);

      if (text && el) {
        el.style.display = 'block';
        el.style.opacity = 0;
        el.innerHTML = convertor.toHtml(text);
        _.defer(() => el.style.opacity = 1);
      }
    }).catch(error => console.error('errrrrr', error));

    return {docHTML: '<div class="rodeo-ace-pane-docstring" style="overflow: auto; display: none;" id="' + id + '"></div>'};
  }
};

