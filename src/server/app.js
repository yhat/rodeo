var fs = require('fs');
var path = require('path');
var express = require('express');
var WebSocketServer = require('ws').Server;
var sshClient = require('ssh2').Client;
var bodyParser = require('body-parser');
var kernel = require('./kernel');
var findFile = require('./find-file');

var app = express();
// setup static assets route handler
app.use(express.static(path.join(__dirname, '..', '..', '/static')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


global.python = null;
global.USER_WD = __dirname;



kernel(function(err, python) {
  global.python = python;
  if (err) {
    console.log("[ERROR]: " + err);
  }
  if (python==null) {
    console.log("[ERROR]: python came back null");
  }
});

PREFERENCES = {
  "id": "ec34d8516b5d429de5f7c04668d82f6b9b178a78",
  "version": "1.0.2",
  "paneVertical": "49.166666666666664%",
  "paneHorizontalRight": "48.648648648648646%",
  "paneHorizontalLeft": "48.648648648648646%",
  "fontSize": 10,
  "defaultWd": "/Users/glamp/repos/yhat/blog/code-exp/39",
  "editorTheme": "ace/theme/chrome",
  "pythonCmd": "/usr/local/bin/python3"
}


app.get('/', function(req, res) {
  var filepath = path.join(__dirname, '..', '..', './static/server-index.html');
  res.sendFile(filepath);
});

app.get('/command', function(req, res) {
  if (req.query.stream=='true') {
    res.set('Content-Type', 'text/event-stream');
    python.executeStream(req.query.command, req.query.autocomplete=="true", function(result) {
      res.write(JSON.stringify(result) + '\n');
      if (result.status=="complete") {
        res.end()
      }
    });
  } else {
    python.execute(req.query.command, req.query.autocomplete=="true", function(result) {
      result.status = "complete";
      res.json(result);
    });
  }
});

app.get('/wd', function(req, res) {
  res.send(USER_WD);
});

app.post('/wd', function(req, res) {
  if (fs.existsSync(req.body.wd)) {
    USER_WD = req.body.wd;
    res.send(USER_WD);
  } else {
    res.json({
      status: "error",
      message: "Filepath `" + req.body.wd + "` does not exist."
    });
  }
});

app.get('/variable', function(req, res) {
  var varname = req.query.name
  var show_var_statements = {
    DataFrame: "print(" + varname + "[:1000].to_html())",
    Series: "print(" + varname + "[:1000].to_frame().to_html())",
    list: "pp.pprint(" + varname + ")",
    ndarray: "pp.pprint(" + varname + ")",
    dict: "pp.pprint(" + varname + ")"
  };

  var command = show_var_statements[req.query.type];
  python.execute(command, false, function(result) {
    res.send(result.output);
    // var filepath = path.join(__dirname, '..', '..', './static/display-variable.html');
    // res.sendFile(filepath);
  });
});

app.get('/files', function(req, res) {
  var dirname = path.resolve(req.query.dir || USER_WD);
  USER_WD = dirname
  var files = fs.readdirSync(dirname).map(function(filename) {
    return {
      filename: path.join(dirname, filename),
      basename: filename,
      isDir: fs.lstatSync(path.join(dirname, filename)).isDirectory()
    }
  });
  res.json({
    status: "OK",
    files: files,
    dir: dirname
  });
});

app.get('/file', function(req, res) {
  if (req.query.filepath) {
    fs.readFile(req.query.filepath, function(err, data) {
      if (err) {
        res.json({
          status: "error",
          message: err.toString()
        });
      } else {
        res.json({
          status: "OK",
          filepath: req.query.filepath,
          basename: path.basename(req.query.filepath),
          content: data.toString()
        });
      }
    });
  }
});

app.post('/file', function(req, res) {
  fs.writeFile(req.body.filepath, req.body.content, function(err) {
    if (err) {
      res.json({ error: err });
    } else {
      res.json({
        status: "OK",
        filepath: req.body.filepath,
        basename: path.basename(req.body.filepath)
      });
    }
  });
});

app.get('/preferences', function(req, res) {
  res.json(PREFERENCES);
});

app.post('/preferences', function(req, res) {
  if (req.body.name) {
    PREFERENCES[req.body.name] = req.body.value;
  }
  res.json(PREFERENCES);
});

var profile;
app.get('/profile', function(req, res) {
  if (profile==null) {
    profile = fs.readFileSync(path.join(__dirname, '..', 'default-rodeo-profile.txt'));
  }
  res.send(profile);
});

app.post('/profile', function(req, res) {
  profile = req.body.profile;
  res.send(profile);
});

app.get('/about', function(req, res) {
  var filepath = path.join(__dirname, '..', '..', './static/about.html');
  res.sendFile(filepath);
});

var PORT = parseInt(process.env.PORT || "3000");
var HOST = process.env.HOST || "0.0.0.0";
var server = app.listen(PORT, HOST);
console.log("The party is at: " + HOST + ":" + PORT);

var wss = new WebSocketServer({ server: server });

wss.on('connection', function (ws) {

  ws.sendJSON = function(data) {
    ws.send(JSON.stringify(data));
  }
  ws.sendJSON({ msg: 'refresh-variables' });
  ws.sendJSON({ msg: 'refresh-packages' });
  ws.sendJSON({ msg: 'set-working-directory', wd: global.USER_WD || '.' });

  ws.on('message', function(data) {
    if (data.msg=="index-files") {
      findFile(ws);
    }
  });

});
