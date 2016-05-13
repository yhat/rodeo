import _ from 'lodash';
import {send} from './ipc';

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
      lineLengths = _.map(code.split('\n', pos.row), line => line.length + 1),
      cursorPos = _.sum(lineLengths) + pos.column;

    return send('get_auto_complete', code, cursorPos).then(function (result) {
      console.log('autocomplete', result);
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

