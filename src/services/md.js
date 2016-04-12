'use strict';

const _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  marked = require('marked'),
  highlight = require('highlight.js'),
  Handlebars = require('handlebars'),
  async = require('async'),
  log = require('./log').asInternal(__filename),
  codeBlockToken = /^```/mg,
  languageSelectToken = /^\{(.+)\}/;
let repeatedLanguages = ['python'],
  templateFile, source, reportTemplate;

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


function knitHTML(doc, python, fn) {
  let cells = splitUpCells(doc);

  async.map(cells, function (cell, cb) {
    if (cell.execute == 'markdown') {
      cb(null, [{ html: marked(cell.data) }]);
    } else if (cell.execute == 'mathjax') {
      cb(null, [{ html: cell.data }]);
    } else if (cell.execute == 'python') {
      let results = [];
      
      python.executeStream(cell.data, false, function(result) {
        results.push(result);
        if (result.status == 'complete') {
          cb(null, results);
        }
      });
    } else {
      cb(null, [{ html: marked(cell.data) }]);
    }
  }, function (err, results) {
    let output = [];

    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < results[i].length; j++) {
        let line = results[i][j];

        if (line.image) {
          let img = "<img src='data:image/png;base64," + line.image.trim() + "' />";

          output.push(img);
        } else if (line.output) {
          output.push('<pre>' + line.output + '</pre>');
        } else if (line.stream) {
          output.push('<pre>' + line.stream + '</pre>');
        } else if (line.html) {
          output.push(line.html);
        }
      }
    }
    fn(err, output.join('\n'));
  });
}

templateFile = path.join(__dirname, 'markdown-output.hbs');
source = fs.readFileSync(templateFile).toString();
reportTemplate = Handlebars.compile(source);

function apply(doc, python, includeMeta, fn) {
  knitHTML(doc, python, function (err, html) {
    if (err) {
      log('error', err);
      return;
    }

    if (includeMeta) {
      html = reportTemplate({ renderedMarkdown: html });
    }

    fn(null, html);
  });
}

module.exports.setRepeatedLanguages = setRepeatedLanguages;
module.exports.splitUpCells = splitUpCells;
module.exports.knitHTML = knitHTML;
module.exports.apply = apply;