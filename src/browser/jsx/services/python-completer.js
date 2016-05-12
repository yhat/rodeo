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
    const code = session.getValue(),
    // get the line lengths up to the current position
      lineLengths = _.dropRight(_.map(code.split('\n', pos.row), line => line.length), 1),
      cursorPos = _.sum(lineLengths) + pos.column;

    console.log({lineLengths, cursorPos, pos, prefix});

    return send('get_auto_complete', code, cursorPos).then(function (result) {
      console.log('autocomplete', result);
      callback(null, _.map(result.matches, function (match) {
        return {
          // snippet: 'snippet' + match, // thing that replaces section
          caption: match // thing shown on left
          // meta: 'meta' + match // thing shown on right
        };
      }));
    }).catch(error => console.error(error));
  }
};

