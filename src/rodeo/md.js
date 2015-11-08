var fs = require('fs');
var path = require('path');
var marked = require('marked');
var highlight = require('highlight.js');
var Handlebars = require('handlebars');
var async = require('async');

marked.setOptions({
  highlight: function(code) {
    return highlight.highlightAuto(code).value;
  }
});

function splitUpCells(doc) {
  var newDoc = [];
  newDoc.push({ execute: false, data: '' });
  var doc = doc.split('\n');
  var isCodeBlock = /```/.test(doc[0]);
  var lang = "python";
  if (isCodeBlock==true) {
    lang = /\{(.+)\}/.exec(doc[0])[1];
  }
  for(var i=0; i<doc.length; i++) {
    var line = doc[i];

    if (isCodeBlock) {
      if (/```/.test(line)) {
        isCodeBlock = false;
        if (lang=="python") {
          newDoc.push({ execute: "markdown", data: "```" + lang + "\n" + code + "\n```"});
          newDoc.push({ execute: lang || "code", data: code });
          newDoc.push({ execute: "markdown", data: '' });
        } else if (lang=="mathjax") {
          newDoc.push({ execute: "mathjax", data: code });
        }
        code = "";
        continue
      }
      code += line + '\n';
      continue
    }

    if (/```/.test(line)) {
      var code = "";
      isCodeBlock = true;
      if (/\{.+\}/.test(line)) {
        lang = /\{(.+)\}/.exec(line)[1];
      }
    } else {
      if (newDoc.length > 0) {
        newDoc[newDoc.length-1].data += line + '\n';
      } else {
        newDoc.push({ execute: false, data: line + '\n' });
      }
    }
  }
  return newDoc;
}


function knitHTML(doc, python, fn) {
  var cells = splitUpCells(doc);

  async.map(cells, function(cell, cb) {
    if (cell.execute=="markdown") {
      cb(null, [{ html: marked(cell.data) }]);
    } else if (cell.execute=="mathjax") {
      cb(null, [{ html: cell.data }]);
    } else if (cell.execute=="python") {
      var results = [];
      python.executeStream(cell.data, false, function(result) {
        results.push(result);
        if (result.status=="complete") {
          cb(null, results);
        }
      });
    } else {
      cb(null, [{ html: marked(cell.data) }]);
    }
  }, function(err, results) {
    var output = [];
    for(var i=0; i<results.length;i++) {
      for(var j=0; j<results[i].length;j++) {
        var line = results[i][j];
        if (line.image) {
          var img = "<img src='data:image/png;base64," + line.image.trim() + "' />";
          output.push(img);
        } else if (line.output) {
          output.push("<pre>" + line.output + "</pre>");
        } else if (line.stream) {
          output.push("<pre>" + line.stream + "</pre>");
        } else if (line.html) {
          output.push(line.html);
        }
      }
    }
    fn(err, output.join("\n"));
  });
}

var templateFile = path.join(__dirname, '/../../public/handlebars-templates/markdown-output.hbs')
var source = fs.readFileSync(templateFile).toString();
var reportTemplate = Handlebars.compile(source);

module.exports = function(doc, python, fn) {
  knitHTML(doc, python, function(err, html) {
    var html = reportTemplate({ renderedMarkdown: html });
    fn(null, html);
  });
}
