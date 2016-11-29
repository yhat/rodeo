'use strict';

import _ from 'lodash';
import bluebird from 'bluebird';
import files from './files';
import path from 'path';
import marked from 'marked';
import highlight from 'highlight.js';
import Handlebars from 'handlebars';

const log = require('./log').asInternal(__filename),
  codeBlockToken = /^```/mg,
  languageSelectToken = /^\{(.+)\}/,
  reportTemplate = 'md.hbs';
let repeatedLanguages = ['python'];

marked.setOptions({
  highlight: function (code) {
    return highlight.highlightAuto(code).value;
  }
});

function setRepeatedLanguages(list) {
  repeatedLanguages = list;
}

/**
 * @param {string} str
 * @returns {{lang: string, text: string}}
 */
function getBlockLanguage(str) {
  const match = languageSelectToken.exec(str);
  let lang, text;

  if (match) {
    lang = match[1] || 'code';
    text = str.substr(str.indexOf('}') + 1).trim();
  } else {
    lang = 'code';
    text = str.trim();
  }

  return {lang, text};
}

/**
 * @param {string} str
 * @returns {[{data: string, execute: string}]}
 */
function splitUpCells(str) {
  let blocks, actions;

  blocks = str.split(codeBlockToken);
  actions = [];

  // for each even, assume markdown
  for (let i = 0; i < blocks.length; i += 2) {
    actions[i] = { execute: 'markdown', data: blocks[i]};
  }

  // for each odd, assume code
  for (let i = 1; i < blocks.length; i += 2) {
    const match = getBlockLanguage(blocks[i]);

    if (repeatedLanguages.indexOf(match.lang) > -1) {
      // add to the markdown above us
      actions[i - 1].data += '\n```' + match.lang + '\n' + match.text + '\n```';
    }

    actions[i] = { execute: match.lang, data: match.text};
  }

  return actions;
}

function pythonResultToHTML(result) {
  if (result.name === 'stdout' && _.isString(result.text)) {
    return `<pre>${result.text}</pre>`;
  } else {
    log('warn', 'Unknown result:', result);
  }
}

/**
 * @param {object} doc
 * @param {object} pythonInstance
 * @returns {Promise}
 */
function knitHTML(doc, pythonInstance) {
  let actions = splitUpCells(doc),
    languages = {
      python: data => pythonInstance.getResult(data).then(pythonResultToHTML),
      mathjax: data => data,
      markdown: marked,
      defaults: marked
    };

  return bluebird.map(actions, function (action) {
    let result;

    if (languages[action.execute]) {
      result = languages[action.execute](action.data);
    } else {
      // assume markdown
      result = languages.defaults(action.data);
    }
    return result;
  }).then(results => results.join('\n'));

  // async.map(actions, function (cell, cb) {
  //
  //   try {
  //     if (cell.execute == 'markdown') {
  //       cb(null, [{html: marked(cell.data)}]);
  //     } else if (cell.execute == 'mathjax') {
  //       cb(null, [{html: cell.data}]);
  //     } else if (cell.execute == 'python') {
  //       let results = [];
  //
  //       python.getResult(cell.data).then(function (result) {
  //         results.push(result);
  //         if (result.status == 'complete') {
  //           cb(null, results);
  //         }
  //       });
  //     } else {
  //       cb(null, [{html: marked(cell.data)}]);
  //     }
  //   } catch (ex) {
  //     cb(ex);
  //   }
  // }, function (err, results) {
  //   if (err) {
  //     fn(err);
  //     return;
  //   }
  //
  //   let output = [];
  //
  //   for (let i = 0; i < results.length; i++) {
  //     for (let j = 0; j < results[i].length; j++) {
  //       let line = results[i][j];
  //
  //       if (line.image) {
  //         let img = "<img src='data:image/png;base64," + line.image.trim() + "' />";
  //
  //         output.push(img);
  //       } else if (line.output) {
  //         output.push('<pre>' + line.output + '</pre>');
  //       } else if (line.stream) {
  //         output.push('<pre>' + line.stream + '</pre>');
  //       } else if (line.html) {
  //         output.push(line.html);
  //       }
  //     }
  //   }
  //   fn(err, output.join('\n'));
  // });
}

/**
 * @returns {Promise<function>}
 */
function getReportTemplate() {
  return files.readFile(path.join(__dirname, reportTemplate))
    .then(source => Handlebars.compile(source));
}

/**
 * @param {string} html
 * @returns {Promise<string>}
 */
function applyReportTemplate(html) {
  return getReportTemplate()
    .then(reportTemplate => reportTemplate({ renderedMarkdown: html }));
}

module.exports.setRepeatedLanguages = setRepeatedLanguages;
module.exports.splitUpCells = splitUpCells;
module.exports.knitHTML = knitHTML;
module.exports.applyReportTemplate = applyReportTemplate;
