import _ from 'lodash';
import api from './api';
import rules from 'rulejs';
import languageInfo from '../../lang/index.yml';

/**
 * @param {string} str
 * @returns {boolean}
 */
function isProbablyRegExp(str) {
  return _.isString(str) && str[0] === '/';
}

/**
 * @param {string} lang
 * @returns {Promise.object}
 */
function getMap(lang) {
  const ruleSet = _.map(languageInfo.ruleSet, rule => {
      const when = isProbablyRegExp(rule.when) ? new RegExp(rule.when) : rule.when;

      return {when, then: rule.then};
    }),
    langFilename = rules.first(ruleSet, lang);

  return api.send('getI18NText', langFilename);
}

export default {
  getMap
};
