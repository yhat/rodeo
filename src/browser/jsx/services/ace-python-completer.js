import _ from 'lodash';
import client from './client';
import textUtil from './text-util';

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
      callback(null, _.map(result.matches, function (match) {
        let value = match;

        // if it's not a filename and there's a '.' in the value, we want
        // to set the value to just the last item in the list
        if (value.indexOf('/') == -1 && value.indexOf('.') > -1) {
          value = value.split('.').slice(value.split('.').length - 1).join('.');
        }

        return {
          caption: match, // thing shown on left
          value: value,
          score: 100,
          meta: null // thing shown on right
          // docHTML: '<code>' + match + '</code>' + '<br/>' + '<br/>' + '<pre style=\'margin: 0; padding: 0;\'>' +
          //   p.docstring + '</pre>' || '<p>' + match + '</p>'
          // snippet: match, // thing that can replace section
        };
      }));
    }).catch(error => console.error(error));
  }
};

